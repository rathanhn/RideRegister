
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addCoRider } from "@/app/actions";
import { Loader2, User, Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  fullName2: z.string().min(2, "Full name must be at least 2 characters."),
  age2: z.coerce.number().min(18, "Rider must be at least 18 years old.").max(100),
  phoneNumber2: z.string().regex(phoneRegex, "Invalid phone number."),
  photoURL2: z.any().refine(val => val, "Photo is required."),
});

interface AddCoRiderFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  registrationId: string;
}

const fileToDataUri = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function AddCoRiderForm({ isOpen, setIsOpen, registrationId }: AddCoRiderFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName2: "", age2: 18, phoneNumber2: "" },
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
        form.reset();
        setPhotoPreview(null);
    }
  }, [isOpen, form]);

  const { isSubmitting } = form.formState;

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      form.setValue('photoURL2', file, { shouldValidate: true });
    }
  };

  const startFilePolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    let attempts = 0;
    pollingRef.current = setInterval(() => {
      if (photoInputRef.current?.files?.length) {
        const file = photoInputRef.current.files[0];
        setPhotoPreview(URL.createObjectURL(file));
        form.setValue('photoURL2', file, { shouldValidate: true });
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
      attempts++;
      if (attempts > 25 && pollingRef.current) clearInterval(pollingRef.current);
    }, 200);
  };
   
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) };
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    try {
        let photoUrl: string | undefined = undefined;
        if (values.photoURL2 instanceof File) {
            const dataUri = await fileToDataUri(values.photoURL2);
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST', body: JSON.stringify({ file: dataUri }), headers: { 'Content-Type': 'application/json' },
            });
            const { url, error } = await uploadResponse.json();
            if (error || !url) throw new Error(error || 'Failed to upload photo.');
            photoUrl = url;
        } else {
            throw new Error("Photo file is missing.");
        }

        const result = await addCoRider({
            registrationId,
            fullName2: values.fullName2,
            age2: values.age2,
            phoneNumber2: values.phoneNumber2,
            photoURL2: photoUrl
        });

        if (result.success) {
            toast({ title: "Success", description: result.message });
            setIsOpen(false);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Co-Rider</DialogTitle>
          <DialogDescription>Fill in your co-rider's details to upgrade your registration to a duo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormItem>
              <FormLabel>Co-Rider's Photo</FormLabel>
              <FormControl>
                  <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Co-rider preview" fill sizes="96px" className="rounded-full object-cover" />
                        ) : ( <User className="w-10 h-10 text-muted-foreground" />)}
                         {isProcessing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                      </div>
                      <Button type="button" variant="outline" onClick={() => { photoInputRef.current?.click(); startFilePolling(); }} disabled={isProcessing}>
                         <Upload className="mr-2 h-4 w-4" /> {photoPreview ? 'Change' : 'Upload'}
                      </Button>
                      <Input
                        type="file"
                        className="hidden"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        accept="image/png, image/jpeg"
                        disabled={isProcessing}
                      />
                  </div>
              </FormControl>
               <FormMessage>{form.formState.errors.photoURL2?.message}</FormMessage>
            </FormItem>

            <FormField name="fullName2" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Co-Rider's Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="age2" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Co-Rider's Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="phoneNumber2" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Co-Rider's Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Co-Rider & Upgrade
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

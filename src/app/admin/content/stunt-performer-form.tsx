
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { manageStuntPerformer, deleteStuntPerformer } from "@/app/actions";
import type { StuntPerformer, UserRole } from "@/lib/types";
import type { User } from 'firebase/auth';
import { Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(3, "Name is required."),
  role: z.string().min(3, "Role is required."),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  imageHint: z.string().optional(),
  contactNumber: z.string().optional(),
});

interface StuntPerformerFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  performer: StuntPerformer | null;
  user: User | null | undefined;
  userRole: UserRole | null;
}

const fileToDataUri = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function StuntPerformerForm({ isOpen, setIsOpen, performer, user, userRole }: StuntPerformerFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", role: "", imageUrl: "", imageHint: "", contactNumber: "" },
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
        if (performer) {
            form.reset({
              ...performer,
              imageUrl: performer.imageUrl || "",
            });
            setPhotoPreview(performer.imageUrl || null);
        } else {
            form.reset({ name: "", role: "", imageUrl: "", imageHint: "", contactNumber: "" });
            setPhotoPreview(null);
        }
    }
  }, [performer, form, isOpen]);

  const { isSubmitting } = form.formState;

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setPhotoPreview(URL.createObjectURL(file));
      try {
        const dataUri = await fileToDataUri(file);
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({ file: dataUri }),
            headers: { 'Content-Type': 'application/json' },
        });
        const { url, error } = await uploadResponse.json();
        if (error || !url) {
            throw new Error(error || 'Failed to upload photo.');
        }
        form.setValue('imageUrl', url, { shouldValidate: true });
        setPhotoPreview(url);
      } catch (e) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: (e as Error).message });
        setPhotoPreview(performer?.imageUrl || null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const result = await manageStuntPerformer({ ...values, adminId: user.uid, performerId: performer?.id });
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };
  
  const handleDelete = async () => {
    if (!user || !performer) return;
    const result = await deleteStuntPerformer(performer.id, user.uid);
     if (result.success) {
      toast({ title: "Success", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  const nameValue = form.watch("name");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{performer ? "Edit Performer" : "Add Performer"}</DialogTitle>
          <DialogDescription>Fill in the details for the stunt performer.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="role" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Role/Specialty</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormItem>
              <FormLabel>Performer Photo (Optional)</FormLabel>
              <FormControl>
                  <div className="flex items-center gap-4">
                      <Avatar className="w-24 h-24 text-2xl">
                          <AvatarImage src={photoPreview || undefined} alt={nameValue || "Performer"} />
                          <AvatarFallback>
                            {(nameValue || "P").charAt(0)}
                          </AvatarFallback>
                          {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                      </Avatar>

                      <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} disabled={isUploading}>
                         <Upload className="mr-2 h-4 w-4" /> {photoPreview ? 'Change' : 'Upload'}
                      </Button>
                      <Input
                        type="file"
                        className="hidden"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        accept="image/png, image/jpeg"
                        disabled={isUploading}
                      />
                  </div>
              </FormControl>
               <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
            </FormItem>

            <FormField name="imageHint" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Image Hint</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., man on bike" /></FormControl>
                <FormDescription>If you uploaded a photo, describe it in one or two words (e.g., "biker doing stunt").</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="contactNumber" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Contact Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
                {performer ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={isSubmitting}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this performer.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div />}
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {performer ? "Save Changes" : "Create Performer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

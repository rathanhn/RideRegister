
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { manageOrganizer, deleteOrganizer } from "@/app/actions";
import type { Organizer } from "@/lib/types";
import type { User } from 'firebase/auth';
import { Loader2, Trash2, Upload, User as UserIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
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

const formSchema = z.object({
  name: z.string().min(3, "Name is required."),
  role: z.string().min(3, "Role is required."),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageHint: z.string().optional(),
  contactNumber: z.string().optional(),
});

interface OrganizerFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  organizer: Organizer | null;
  user: User | null | undefined;
}

const fileToDataUri = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function OrganizerForm({ isOpen, setIsOpen, organizer, user }: OrganizerFormProps) {
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
        if (organizer) {
            form.reset({
              ...organizer,
              imageUrl: organizer.imageUrl || "",
            });
            setPhotoPreview(organizer.imageUrl);
        } else {
            form.reset({ name: "", role: "", imageUrl: "", imageHint: "", contactNumber: "" });
            setPhotoPreview(null);
        }
    }
  }, [organizer, form, isOpen]);

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
        setPhotoPreview(organizer?.imageUrl || null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const result = await manageOrganizer({ ...values, adminId: user.uid, organizerId: organizer?.id });
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };
  
  const handleDelete = async () => {
    if (!user || !organizer) return;
    const result = await deleteOrganizer(organizer.id, user.uid);
     if (result.success) {
      toast({ title: "Success", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{organizer ? "Edit Organizer" : "Add Organizer"}</DialogTitle>
          <DialogDescription>Fill in the details for the event organizer.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="role" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormItem>
              <FormLabel>Organizer Photo (Optional)</FormLabel>
              <FormControl>
                  <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted">
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Organizer preview" fill sizes="96px" className="rounded-full object-cover" />
                        ) : ( <UserIcon className="w-10 h-10 text-muted-foreground" /> )}
                         {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                      </div>
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
                <FormControl><Input {...field} placeholder="e.g., man portrait" /></FormControl>
                <FormDescription>If you uploaded a photo, describe it in one or two words (e.g., "woman smiling").</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="contactNumber" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Contact Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
                {organizer ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={isSubmitting}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this organizer.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div />}
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {organizer ? "Save Changes" : "Create Organizer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { manageOrganizer, deleteOrganizer } from "@/app/actions";
import type { Organizer } from "@/lib/types";
import type { User } from 'firebase/auth';
import { Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";
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
  imageUrl: z.string().url("A valid photo URL is required."),
  imageHint: z.string().min(2, "Image hint is required"),
  contactNumber: z.string().optional(),
});

interface OrganizerFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  organizer: Organizer | null;
  user: User | null | undefined;
}

export function OrganizerForm({ isOpen, setIsOpen, organizer, user }: OrganizerFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", role: "", imageUrl: "", imageHint: "", contactNumber: "" },
  });

  useEffect(() => {
    if (organizer) {
      form.reset(organizer);
    } else {
      form.reset({ name: "", role: "", imageUrl: "", imageHint: "", contactNumber: "" });
    }
  }, [organizer, form, isOpen]);

  const { isSubmitting } = form.formState;

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
            <FormField name="imageUrl" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} placeholder="https://placehold.co/400x400.png" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="imageHint" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} placeholder="man portrait" /></FormControl><FormMessage /></FormItem>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {organizer ? "Save Changes" : "Create Organizer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

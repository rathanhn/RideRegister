
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { managePromotion, deletePromotion } from "@/app/actions";
import type { Offer } from "@/lib/types";
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
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  validity: z.string().min(3, "Validity is required."),
  imageUrl: z.string().url("A valid photo URL is required."),
  imageHint: z.string().min(2, "Image hint is required"),
  actualPrice: z.coerce.number().optional(),
  offerPrice: z.coerce.number().optional(),
});

interface PromotionFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  promotion: Offer | null;
  user: User | null | undefined;
}

export function PromotionForm({ isOpen, setIsOpen, promotion, user }: PromotionFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", validity: "", imageUrl: "", imageHint: "", actualPrice: undefined, offerPrice: undefined },
  });

  useEffect(() => {
    if (promotion) {
      form.reset(promotion);
    } else {
      form.reset({ title: "", description: "", validity: "", imageUrl: "", imageHint: "", actualPrice: undefined, offerPrice: undefined });
    }
  }, [promotion, form, isOpen]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const result = await managePromotion({ ...values, adminId: user.uid, promotionId: promotion?.id });
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };
  
  const handleDelete = async () => {
    if (!user || !promotion) return;
    const result = await deletePromotion(promotion.id, user.uid);
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
          <DialogTitle>{promotion ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
          <DialogDescription>Fill in the details for the shop promotion.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="validity" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Validity</FormLabel><FormControl><Input {...field} placeholder="e.g., Valid until August 15th" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="imageUrl" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} placeholder="https://placehold.co/600x400.png" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="imageHint" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} placeholder="riding gloves" /></FormControl><FormMessage /></FormItem>
            )} />
             <div className="grid grid-cols-2 gap-4">
                 <FormField name="actualPrice" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Actual Price (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="offerPrice" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Offer Price (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
                {promotion ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={isSubmitting}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this promotion.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div />}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {promotion ? "Save Changes" : "Create Promotion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

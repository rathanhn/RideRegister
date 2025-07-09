
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { addFormField } from "@/app/actions";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { FormFieldDefinition, FormFieldType } from "@/lib/types";

const formSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters."),
  name: z.string().min(2, "Name must be at least 2 characters.")
         .regex(/^[a-z][a-zA-Z0-9]*$/, "Name must be in camelCase, e.g., 'fullName'"),
  type: z.enum(['text', 'number', 'email', 'tel', 'checkbox']),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

interface FormFieldDialogProps {
    children: React.ReactNode; // The trigger button
    field?: FormFieldDefinition;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const fieldTypes: FormFieldType[] = ['text', 'number', 'email', 'tel', 'checkbox'];

export function FormFieldDialog({ children, field, open, onOpenChange, onSuccess }: FormFieldDialogProps) {
    const { toast } = useToast();
    const [user] = useAuthState(auth);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: field?.label ?? "",
            name: field?.name ?? "",
            type: field?.type ?? "text",
            required: field?.required ?? false,
            placeholder: field?.placeholder ?? "",
        },
    });

    const { isSubmitting } = form.formState;
    const dialogTitle = field ? "Edit Form Field" : "Add New Form Field";

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }

        try {
            const result = await addFormField({ ...values, adminId: user.uid });

            if (result.success) {
                toast({ title: "Success!", description: result.message });
                form.reset();
                onSuccess?.();
            } else {
                throw new Error(result.message || "An unknown error occurred.");
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Uh oh! Something went wrong.", description: (e as Error).message });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        Define the properties for this form field. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="label" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Field Label</FormLabel>
                                <FormControl><Input placeholder="e.g., Full Name" {...field} /></FormControl>
                                <FormDescription>This is what users will see.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Field Name (Key)</FormLabel>
                                <FormControl><Input placeholder="e.g., fullName" {...field} /></FormControl>
                                <FormDescription>camelCase key for the database.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Field Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a field type" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {fieldTypes.map(type => (
                                            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="placeholder" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Placeholder (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g., Enter your name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="required" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Required</FormLabel>
                                    <FormDescription>
                                        Is this field mandatory for users to fill out?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Saving..." : "Save Field"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

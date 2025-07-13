
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { requestOrganizerAccess } from "@/app/actions";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { AppUser } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";

const formSchema = z.object({
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to proceed.",
  }),
});

const organizerRules = [
  "Assist with event setup, check-in, and breakdown.",
  "Help guide and support riders along the route.",
  "Communicate clearly and respectfully with all participants.",
  "Follow all instructions from the lead event coordinators.",
  "Be available for the entire duration of the event schedule.",
  "Uphold a positive and helpful attitude at all times."
];

interface OrganizerAgreementFormProps {
  onSuccess?: (newUserData: AppUser) => void;
}

export function OrganizerAgreementForm({ onSuccess }: OrganizerAgreementFormProps) {
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent: false,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to submit a request. Please create a Rider account first, then log in and return here." });
      return;
    }

    try {
      const result = await requestOrganizerAccess({
        userId: user.uid,
        consent: values.consent,
      });

      if (result.success) {
        toast({
          title: "Request Submitted!",
          description: "An admin will review your request. You will be able to access the admin panel once approved.",
          action: <ShieldCheck className="text-primary" />,
        });
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && onSuccess) {
           onSuccess({id: user.uid, ...userDoc.data()} as AppUser);
        }

      } else {
        throw new Error(result.message || "An unknown error occurred.");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (e as Error).message,
      });
    }
  }
  
  if (loading) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Organizer Access Request</CardTitle>
        <CardDescription>
          Please read and agree to the responsibilities below to request access to the event management tools. You must have a registered account first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium text-base">Organizer Responsibilities</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {organizerRules.map(rule => <li key={rule}>{rule}</li>)}
                </ul>
              </div>
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have read and agree to the organizer responsibilities.</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid || !user}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            {!user && <p className="text-sm text-destructive text-center">Please log in to submit a request.</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

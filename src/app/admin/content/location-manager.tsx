
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { manageLocation } from "@/app/actions";
import type { LocationSettings, UserRole } from "@/lib/types";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Loader2, AlertTriangle, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  origin: z.string().min(5, "Origin is required."),
  destination: z.string().min(5, "Destination is required."),
});

export function LocationManager() {
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  
  const [locationSettings, loading, error] = useDocument(doc(db, 'settings', 'route'));
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { origin: "", destination: "" },
  });

   useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(doc => {
            if (doc.exists()) {
                setUserRole(doc.data().role as UserRole);
            }
        })
    }
  }, [user]);

  useEffect(() => {
    if (locationSettings?.exists()) {
      form.reset(locationSettings.data() as LocationSettings);
    }
  }, [locationSettings, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const result = await manageLocation({ ...values, adminId: user.uid });
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const isLoading = loading || authLoading;
  const isSuperAdmin = userRole === 'superadmin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Ride Location</CardTitle>
        <CardDescription>Set the starting point and destination for the ride route map.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : error ? (
            <div className="text-destructive flex items-center gap-2">
                <AlertTriangle/> Error loading location data.
            </div>
        ) : !isSuperAdmin ? (
             <div className="text-muted-foreground flex items-center gap-2 p-4 bg-secondary rounded-md h-full text-sm">
                <ShieldAlert className="h-5 w-5" />
                <p>Only Super Admins can change the location.</p>
            </div>
        ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="origin" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Location (Origin)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Telefun Mobiles, Madikeri" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField name="destination" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Location (Destination)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Nisargadhama, Kushalnagar" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting || !isSuperAdmin}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4"/>
                  Save Location
                </Button>
              </form>
            </Form>
        )}
      </CardContent>
    </Card>
  );
}

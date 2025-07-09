
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ensureUserDocument } from "@/app/actions";

// Attach reCAPTCHA verifier to window
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const phoneFormSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number including country code (e.g., +1... or +91...)."),
});

const otpFormSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

export function PhoneAuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });

    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

  const onPhoneSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA verifier not initialized.");
      }
      const result = await signInWithPhoneNumber(auth, values.phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      toast({ title: "Verification code sent", description: `An SMS has been sent to ${values.phone}` });
    } catch (error: any) {
      console.error("SMS sending error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message.replace('Firebase: ', '') });
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (values: z.infer<typeof otpFormSchema>) => {
    setLoading(true);
    if (!confirmationResult) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong. Please try again." });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await confirmationResult.confirm(values.otp);
      const user = userCredential.user;
      
      // Ensure user document exists in Firestore
      await ensureUserDocument(user.uid, user.phoneNumber);

      toast({ title: "Success!", description: "You have been logged in." });
      router.push("/dashboard");

    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP or request expired. Please try again." });
      // Optionally reset the view
      setShowOtpInput(false);
      setConfirmationResult(null);
      phoneForm.reset();
      otpForm.reset();
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {!showOtpInput ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code (OTP)</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Sign In
                </Button>
                <Button variant="outline" onClick={() => setShowOtpInput(false)} disabled={loading}>
                    Back
                </Button>
             </div>
          </form>
        </Form>
      )}
      <div id="recaptcha-container" className="mt-4"></div>
    </div>
  );
}

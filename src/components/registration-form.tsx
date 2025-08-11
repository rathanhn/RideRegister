
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Loader2, PartyPopper, User, Users, Upload } from "lucide-react";
import { createAccountAndRegisterRider } from "@/app/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "./ui/separator";
import { auth, db } from "@/lib/firebase";
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";


const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const rideRules = [
    { id: 'rule1', text: "A helmet is compulsory for all riders." },
    { id: 'rule2', text: "Obey all traffic laws and signals." },
    { id: 'rule3', text: "Maintain a safe distance from other riders." },
    { id: 'rule4', text: "No racing or dangerous stunts are allowed." },
    { id: 'rule5', text: "Follow instructions from event organizers at all times." },
    { id: 'rule6', text: "Ensure your bicycle is in good working condition." },
    { id: 'rule7', text: "Riders are recommended to wear necessary gear like a jacket, shoes, and suitable pants." }
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const formSchema = z
  .object({
    email: z.string().email("A valid email is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
    
    registrationType: z.enum(["solo", "duo"], {
      required_error: "You need to select a registration type.",
    }),
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    age: z.coerce.number().min(18, "You must be at least 18 years old.").max(100),
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number."),
    whatsappNumber: z.string().optional(),
    photoURL: z.any().optional(),

    // Rider 2
    fullName2: z.string().optional(),
    age2: z.coerce.number().optional(),
    phoneNumber2: z.string().optional(),
    photoURL2: z.any().optional(),
    
    // Individual rule consents
    rule1: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule2: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule3: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule4: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule5: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule6: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule7: z.boolean().refine(val => val, { message: "You must agree to this rule." }),

  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (data.registrationType === "duo") {
      if (!data.fullName2 || data.fullName2.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Full name must be at least 2 characters.", path: ["fullName2"] });
      }
      if (!data.age2 || data.age2 < 18) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rider must be at least 18 years old.", path: ["age2"] });
      }
      if (!data.phoneNumber2 || !phoneRegex.test(data.phoneNumber2)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid phone number.", path: ["phoneNumber2"] });
      }
    }
  });


// Helper to convert file to Base64 Data URI
const fileToDataUri = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export function RegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [signInWithEmailAndPassword, , , signInError] = useSignInWithEmailAndPassword(auth);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  
  const [photoPreview1, setPhotoPreview1] = useState<string | null>(null);
  const photoInputRef1 = useRef<HTMLInputElement>(null);

  const [photoPreview2, setPhotoPreview2] = useState<string | null>(null);
  const photoInputRef2 = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      registrationType: "solo",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      age: 18,
      phoneNumber: "",
      whatsappNumber: "",
      rule1: false,
      rule2: false,
      rule3: false,
      rule4: false,
      rule5: false,
      rule6: false,
      rule7: false,
    },
  });

  const { isSubmitting } = form.formState;
  const registrationType = form.watch("registrationType");
  const phoneNumber = form.watch("phoneNumber");

  useEffect(() => {
    if (sameAsPhone) {
      form.setValue("whatsappNumber", phoneNumber, { shouldValidate: true });
    }
  }, [sameAsPhone, phoneNumber, form]);
  
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>, rider: 1 | 2) => {
    const file = event.target.files?.[0];
    if (file) {
      if (rider === 1) {
        setPhotoPreview1(URL.createObjectURL(file));
        form.setValue('photoURL', file, { shouldValidate: true });
      } else {
        setPhotoPreview2(URL.createObjectURL(file));
        form.setValue('photoURL2', file, { shouldValidate: true });
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("[Client] Form submitted. Values:", values);
    
    setIsProcessing(true);

    try {
        let finalPhotoUrl1: string | undefined = undefined;
        let finalPhotoUrl2: string | undefined = undefined;
        const { photoURL, photoURL2, ...restOfValues } = values;


        if (photoURL instanceof File) {
            console.log("[Client] Uploading photo 1...");
            const dataUri = await fileToDataUri(photoURL);
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({ file: dataUri }),
                headers: { 'Content-Type': 'application/json' },
            });
            const { url, error } = await uploadResponse.json();
            if (error || !url) throw new Error(error || 'Failed to upload photo 1.');
            finalPhotoUrl1 = url;
        }

        if (registrationType === 'duo' && photoURL2 instanceof File) {
             console.log("[Client] Uploading photo 2...");
            const dataUri = await fileToDataUri(photoURL2);
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({ file: dataUri }),
                headers: { 'Content-Type': 'application/json' },
            });
            const { url, error } = await uploadResponse.json();
            if (error || !url) throw new Error(error || 'Failed to upload photo 2.');
            finalPhotoUrl2 = url;
        }
      
      const submissionData = { ...restOfValues, photoURL: finalPhotoUrl1, photoURL2: finalPhotoUrl2 };

      console.log("[Client] Calling createAccountAndRegisterRider with data:", submissionData);
      const result = await createAccountAndRegisterRider(submissionData);
      console.log("[Client] Got result from server action:", result);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
          action: <PartyPopper className="text-primary" />,
        });

        const userCredential = await signInWithEmailAndPassword(values.email, values.password);

        if (userCredential) {
             if (result.existingUser && result.dataForExistingUser) {
                const uid = userCredential.user.uid;
                const registrationRef = doc(db, "registrations", uid);
                await setDoc(registrationRef, { ...result.dataForExistingUser, uid });
                console.log(`[Client] Registration document created for existing user UID: ${uid}`);
            }
            router.push('/dashboard');
        } else {
             throw new Error(signInError?.message || "Could not log you in. Please go to the login page.");
        }

      } else {
        throw new Error(result.message || "An unknown error occurred.");
      }
    } catch (e) {
      console.error("[Client] Error in onSubmit:", e);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (e as Error).message || "There was a problem with your registration.",
      });
    } finally {
      setIsProcessing(false);
    }
  }


  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create Account &amp; Register</CardTitle>
        <CardDescription>Fill in your details below to join the ride. Already have an account? <a href="/login" className="text-primary hover:underline">Login here</a>.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <h3 className="text-lg font-medium text-primary">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="Min. 6 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="Re-enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <Separator />
            <h3 className="text-lg font-medium text-primary">Ride &amp; Rider Details</h3>
            
            <FormField
              control={form.control}
              name="registrationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Registration Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="solo" id="solo" className="peer sr-only" /></FormControl>
                        <FormLabel htmlFor="solo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&amp;:has([data-state=checked])]:border-primary w-full cursor-pointer">
                            <User className="mb-3 h-6 w-6" /> Solo Rider
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="duo" id="duo" className="peer sr-only" /></FormControl>
                        <FormLabel htmlFor="duo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&amp;:has([data-state=checked])]:border-primary w-full cursor-pointer">
                           <Users className="mb-3 h-6 w-6" /> Duo (2 Riders)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            <h3 className="text-lg font-medium">Rider 1 Information</h3>
            
            <FormItem>
              <FormLabel>Profile Photo (Rider 1)</FormLabel>
              <FormControl>
                  <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                        {photoPreview1 ? (
                            <Image src={photoPreview1} alt="Profile preview" width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => photoInputRef1.current?.click()} disabled={isSubmitting || isProcessing}>
                         <Upload className="mr-2 h-4 w-4" /> Change Photo
                      </Button>
                      <Input
                        type="file"
                        className="hidden"
                        ref={photoInputRef1}
                        onChange={(e) => handlePhotoChange(e, 1)}
                        accept="image/png, image/jpeg"
                      />
                  </div>
              </FormControl>
              <FormDescription>Upload a clear photo. This will be on your ticket.</FormDescription>
              <FormMessage />
            </FormItem>

            <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormDescription>This will be your account display name.</FormDescription><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="18" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <div className="space-y-2">
                <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>WhatsApp Number (Optional)</FormLabel>
                        <FormControl>
                        <Input placeholder="Same as phone" {...field} disabled={sameAsPhone} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="sameAsPhone"
                        checked={sameAsPhone}
                        onCheckedChange={(checked) => setSameAsPhone(!!checked)}
                    />
                    <label
                        htmlFor="sameAsPhone"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Same as phone number
                    </label>
                </div>
            </div>


            {registrationType === "duo" && (
                <>
                    <Separator />
                    <h3 className="text-lg font-medium">Rider 2 Information</h3>
                     <FormItem>
                        <FormLabel>Profile Photo (Rider 2)</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-4">
                                <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                                    {photoPreview2 ? (
                                        <Image src={photoPreview2} alt="Rider 2 preview" width={96} height={96} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-muted-foreground" />
                                    )}
                                </div>
                                <Button type="button" variant="outline" onClick={() => photoInputRef2.current?.click()} disabled={isSubmitting || isProcessing}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                </Button>
                                <Input
                                    type="file"
                                    className="hidden"
                                    ref={photoInputRef2}
                                    onChange={(e) => handlePhotoChange(e, 2)}
                                    accept="image/png, image/jpeg"
                                />
                            </div>
                        </FormControl>
                        <FormDescription>Upload a clear photo of the second rider.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    <FormField control={form.control} name="fullName2" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="age2" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="18" onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phoneNumber2" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </>
            )}

            <div className="space-y-4">
                <div className="space-y-2 rounded-md border p-4">
                    <h4 className="font-medium text-base">General Ride Rules &amp; Consent</h4>
                     <p className="text-sm text-muted-foreground">Please read and agree to all rules to continue.</p>
                     <div className="space-y-4 pt-2">
                        {rideRules.map((rule) => (
                             <FormField
                                key={rule.id}
                                control={form.control}
                                name={rule.id as 'rule1'}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-normal">{rule.text}</FormLabel>
                                        <FormMessage />
                                    </div>
                                    </FormItem>
                                )}
                                />
                        ))}
                    </div>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid || isProcessing}>
              {(isSubmitting || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? "Submitting..." : "Create Account &amp; Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}

    
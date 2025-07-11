
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Loader2, PartyPopper, User, Users, Upload, X } from "lucide-react";
import { registerRider, uploadPhoto } from "@/app/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "./ui/separator";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { Registration } from "@/lib/types";
import Image from "next/image";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z
  .object({
    registrationType: z.enum(["solo", "duo"], {
      required_error: "You need to select a registration type.",
    }),
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    age: z.coerce.number().min(18, "You must be at least 18 years old.").max(100),
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number."),
    whatsappNumber: z.string().optional(),
    photoURL: z.string().optional(),

    // Rider 2
    fullName2: z.string().optional(),
    age2: z.coerce.number().optional(),
    phoneNumber2: z.string().optional(),
    photoURL2: z.string().optional(),

    consent: z.boolean().refine((val) => val === true, {
      message: "You must agree to the rules.",
    }),
  })
  .superRefine((data, ctx) => {
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

const rideRules = [
    "A helmet is compulsory for all riders.",
    "Obey all traffic laws and signals.",
    "Maintain a safe distance from other riders.",
    "No racing or dangerous stunts are allowed.",
    "Follow instructions from event organizers at all times.",
    "Ensure your bicycle is in good working condition."
];

interface RegistrationFormProps {
    onSuccess: (registrationData: Registration) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [photoPreview2, setPhotoPreview2] = useState<string | null>(null);
  const [isUploading2, setIsUploading2] = useState(false);
  const photoInputRef2 = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      registrationType: "solo",
      fullName: "",
      age: 18,
      phoneNumber: "",
      whatsappNumber: "",
      photoURL: "",
      consent: false,
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

  useEffect(() => {
    if (user) {
        form.setValue("fullName", user.displayName || "");
        if (user.photoURL) {
            form.setValue("photoURL", user.photoURL);
            setPhotoPreview(user.photoURL);
        }
    }
  }, [user, form]);
  
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', file);
      const result = await uploadPhoto(formData);
      if (result.success && result.url) {
        form.setValue('photoURL', result.url, { shouldValidate: true });
        setPhotoPreview(result.url);
      } else {
        toast({ variant: 'destructive', title: 'Upload Failed', description: result.message });
        setPhotoPreview(user?.photoURL ?? null);
      }
      setIsUploading(false);
    }
  };

  const handlePhotoChange2 = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPreview2(URL.createObjectURL(file));
      setIsUploading2(true);
      const formData = new FormData();
      formData.append('photo', file);
      const result = await uploadPhoto(formData);
      if (result.success && result.url) {
        form.setValue('photoURL2', result.url, { shouldValidate: true });
        setPhotoPreview2(result.url);
      } else {
        toast({ variant: 'destructive', title: 'Upload Failed', description: result.message });
        setPhotoPreview2(null);
      }
      setIsUploading2(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to register."});
        return;
    }

    try {
      const result = await registerRider({
          ...values,
          uid: user.uid,
          email: user.email!,
          photoURL: values.photoURL || user.photoURL || undefined,
      });

      if (result.success) {
        toast({
          title: "Registration Submitted!",
          description: "We're excited to have you join the ride. Your registration is now pending review.",
          action: <PartyPopper className="text-primary" />,
        });
        
        const newRegistrationData: Registration = {
            id: user.uid,
            ...values,
            photoURL: values.photoURL || user.photoURL || undefined,
            status: 'pending',
            createdAt: new Date(), 
            rider1CheckedIn: false,
            rider2CheckedIn: false,
        }
        onSuccess(newRegistrationData);
      } else {
        throw new Error(result.message || "An unknown error occurred while saving your registration.");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (e as Error).message || "There was a problem with your registration.",
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
        <CardTitle className="font-headline text-3xl">Ride Application Form</CardTitle>
        <CardDescription>Fill in your details below to join the ride. Event Date: 15th August.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <FormLabel htmlFor="solo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
                            <User className="mb-3 h-6 w-6" /> Solo Rider
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="duo" id="duo" className="peer sr-only" /></FormControl>
                        <FormLabel htmlFor="duo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer">
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
            <h3 className="text-lg font-medium text-primary">Rider 1 Information</h3>
            
            <FormItem>
              <FormLabel>Profile Photo (Rider 1)</FormLabel>
              <FormControl>
                  <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center">
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Profile preview" layout="fill" className="rounded-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-muted-foreground" />
                        )}
                         {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                         )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} disabled={isUploading}>
                         <Upload className="mr-2 h-4 w-4" /> Change Photo
                      </Button>
                      <Input
                        type="file"
                        className="hidden"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        accept="image/png, image/jpeg"
                      />
                  </div>
              </FormControl>
              <FormDescription>Upload a clear photo. If not provided, your Gmail photo will be used.</FormDescription>
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
                    <h3 className="text-lg font-medium text-primary">Rider 2 Information</h3>
                     <FormItem>
                        <FormLabel>Profile Photo (Rider 2)</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-4">
                                <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center">
                                    {photoPreview2 ? (
                                        <Image src={photoPreview2} alt="Rider 2 preview" layout="fill" className="rounded-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-muted-foreground" />
                                    )}
                                    {isUploading2 && (
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <Button type="button" variant="outline" onClick={() => photoInputRef2.current?.click()} disabled={isUploading2}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                </Button>
                                <Input
                                    type="file"
                                    className="hidden"
                                    ref={photoInputRef2}
                                    onChange={handlePhotoChange2}
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
                    <h4 className="font-medium text-base">General Ride Rules</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {rideRules.map(rule => <li key={rule}>{rule}</li>)}
                    </ul>
                </div>
                 <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to abide by the ride rules and safety measures.</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid || isUploading || isUploading2}>
              {(isSubmitting || isUploading || isUploading2) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading Photo 1..." : isUploading2 ? "Uploading Photo 2..." : isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

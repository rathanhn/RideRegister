
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/actions";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
});


export function CreateAccountForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [
    signInWithEmailAndPassword,
    ,
    loadingSignIn,
    ,
  ] = useSignInWithEmailAndPassword(auth);
  const [isCreating, setIsCreating] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const isSubmitting = isCreating || loadingSignIn;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true);
    try {
      const result = await createUser(values);

      if (result.success) {
        toast({
          title: "Account Created!",
          description: "You can now log in and complete your ride registration.",
          action: <PartyPopper className="text-primary" />,
        });
        
        // Log the user in automatically after successful creation
        await signInWithEmailAndPassword(values.email, values.password);

        form.reset();
        router.push('/dashboard'); // Redirect to dashboard to fill application
      } else {
        throw new Error(result.message || "An unknown error occurred.");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (e as Error).message,
      });
    } finally {
        setIsCreating(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
        <CardDescription>Get started by creating a new account. It's quick and easy.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
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
                    <Input type="password" placeholder="Min. 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

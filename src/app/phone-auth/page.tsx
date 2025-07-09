
import { PhoneAuthForm } from '@/components/phone-auth-form';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

export default function PhoneAuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
         <div className="w-full max-w-md mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <Phone className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Phone Number Verification</CardTitle>
                    <CardDescription>
                        Enter your phone number to sign in or create an account.
                         <p className="text-xs mt-2">
                           Note: You may need to enable the Phone Number sign-in provider in your Firebase project settings.
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PhoneAuthForm />
                </CardContent>
             </Card>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Prefer another method?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in here
                </Link>
            </p>
         </div>
      </div>
    </div>
  );
}

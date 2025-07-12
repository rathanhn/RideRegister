import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { Header } from '@/components/header';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
         <div className="w-full max-w-md mx-auto">
            <ForgotPasswordForm />
             <p className="mt-4 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login here
                </Link>
            </p>
         </div>
      </div>
    </div>
  );
}

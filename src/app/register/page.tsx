import { CreateAccountForm } from '@/components/create-account-form';
import { Header } from '@/components/header';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md mx-auto">
                <CreateAccountForm />
                 <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
}

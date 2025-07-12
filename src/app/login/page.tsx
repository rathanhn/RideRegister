import { LoginForm } from '@/components/login-form';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
         <div className="w-full max-w-md mx-auto">
            <LoginForm />
            <div className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" passHref>
                    <span className="font-semibold text-primary hover:underline cursor-pointer">
                        Forgot Password?
                    </span>
                </Link>
                <Separator className="my-4" />
                <p>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
         </div>
      </div>
    </div>
  );
}

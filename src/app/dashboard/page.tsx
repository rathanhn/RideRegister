"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { DigitalTicket } from '@/components/digital-ticket';
import { Header } from '@/components/header';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Registration } from '@/lib/types';


export default function DashboardPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [registrationData, setRegistrationData] = useState<Registration | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return; // Wait until auth state is loaded
        if (!user) {
            router.push('/login'); // Redirect to login if not authenticated
            return;
        }

        const fetchRegistrationData = async () => {
            try {
                const docRef = doc(db, 'registrations', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRegistrationData({ id: docSnap.id, ...docSnap.data() } as Registration);
                } else {
                    setRegistrationData(null); // No registration found for this user
                }
            } catch (err) {
                console.error("Error fetching registration data:", err);
                setFetchError("Failed to load your registration details. Please try again later.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchRegistrationData();

    }, [user, loading, router]);


    if (loading || isLoadingData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error || fetchError) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                            <AlertTriangle /> Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error?.message || fetchError}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
                    {registrationData ? (
                        <DigitalTicket registration={registrationData} user={user} />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Registration Not Found</CardTitle>
                                <CardDescription>
                                    It looks like you haven't registered for the ride yet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link href="/register">Register for the Ride</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

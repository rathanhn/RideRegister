
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { DigitalTicket } from '@/components/digital-ticket';
import { Header } from '@/components/header';
import { Loader2, AlertTriangle, Clock, Ban, User, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Registration, AppUser } from '@/lib/types';
import { RegistrationForm } from '@/components/registration-form';
import { OrganizerAgreementForm } from '@/components/organizer-agreement-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


type ViewState = 'rider' | 'organizer' | null;

export default function DashboardPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [registrationData, setRegistrationData] = useState<Registration | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>(null);

    useEffect(() => {
        if (loading) return; // Wait until auth state is loaded
        if (!user) {
            router.push('/login'); // Redirect to login if not authenticated
            return;
        }

        const fetchData = async () => {
            if (!user) return;
            setIsLoadingData(true);
            try {
                const regDocRef = doc(db, 'registrations', user.uid);
                const userDocRef = doc(db, 'users', user.uid);
                
                const [regDocSnap, userDocSnap] = await Promise.all([
                    getDoc(regDocRef),
                    getDoc(userDocRef)
                ]);

                if (regDocSnap.exists()) {
                    setRegistrationData({ id: regDocSnap.id, ...regDocSnap.data() } as Registration);
                } else {
                    setRegistrationData(null);
                }

                if (userDocSnap.exists()) {
                    setUserData({ id: userDocSnap.id, ...userDocSnap.data() } as AppUser);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setFetchError("Failed to load your details. Please try again later.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();

    }, [user, loading, router]);


    const handleRegistrationSuccess = (newData: Registration) => {
        setRegistrationData(newData);
        setView(null); // Return to dashboard status view
    }
    
    const handleOrganizerRequestSuccess = (newUserData: AppUser) => {
        setUserData(newUserData);
        setView(null); // Return to dashboard status view
    }

    if (loading || isLoadingData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary/50">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error || fetchError) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-secondary/50">
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
    
    // The main logic for what to show on the dashboard
    const renderContent = () => {
        // 1. If user has a registration, show ticket/status. This is the highest priority.
        if (registrationData) {
            switch (registrationData.status) {
                case 'approved':
                     return (
                        <div className="w-full mx-auto space-y-4">
                           <DigitalTicket registration={registrationData} user={user!} />
                        </div>
                    );
                case 'pending':
                    return (
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    <Clock className="text-primary"/> Registration Pending
                                </CardTitle>
                                <CardDescription>
                                    Your registration is being reviewed by our team. Please check back later. We'll notify you once it's approved.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    );
                case 'rejected':
                    return (
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                                    <Ban /> Registration Rejected
                                </CardTitle>
                                <CardDescription>
                                    Unfortunately, your registration could not be approved. If you believe this is an error, please contact the event organizers.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    );
            }
        }
        
        // 2. If user is already an admin/viewer, show a specific message.
        if (userData && (userData.role === 'admin' || userData.role === 'superadmin' || userData.role === 'viewer')) {
            return (
                 <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Shield className="text-primary"/> Organizer Account
                        </CardTitle>
                        <CardDescription>
                            Your account has <span className='font-bold'>{userData.role}</span> permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin">
                                Go to Admin Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        // 3. If a view (rider/organizer form) is explicitly selected, show it.
        if (view === 'rider') {
            return <RegistrationForm onSuccess={handleRegistrationSuccess} />;
        }
        if (view === 'organizer') {
            return <OrganizerAgreementForm onSuccess={handleOrganizerRequestSuccess} />;
        }

        // 4. If none of the above, show the initial choice.
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Ride!</CardTitle>
                    <CardDescription>
                        How would you like to participate in this event? Please select an option below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="relative rounded-lg border bg-background p-6 hover:bg-accent hover:text-accent-foreground group">
                        <button onClick={() => setView('rider')} className="absolute inset-0 z-10" aria-label="Register as a Rider"></button>
                        <div className="flex flex-col items-center justify-center h-full text-center">
                             <User className="h-8 w-8 text-primary mb-4" />
                            <h3 className="font-semibold">Register as a Rider</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Join the ride, get your digital ticket, and be part of the cycling community.
                            </p>
                        </div>
                    </div>
                     <div className="relative rounded-lg border bg-background p-6 hover:bg-accent hover:text-accent-foreground group">
                        <button onClick={() => setView('organizer')} className="absolute inset-0 z-10" aria-label="Request Organizer Access"></button>
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Shield className="h-8 w-8 text-primary mb-4" />
                            <h3 className="font-semibold">Request Organizer Access</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Join the event staff as a volunteer or organizer to help manage the event.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold font-headline">
                      Your Dashboard
                    </h1>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

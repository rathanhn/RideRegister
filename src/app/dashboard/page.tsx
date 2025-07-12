
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Header } from '@/components/header';
import { Loader2, AlertTriangle, Shield, ArrowRight, Ban, Clock, Ticket, MessageSquare, ListChecks, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Registration, AppUser } from '@/lib/types';
import { RegistrationForm } from '@/components/registration-form';
import { OrganizerAgreementForm } from '@/components/organizer-agreement-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { DigitalTicket } from '@/components/digital-ticket';
import { DashboardProfileCard } from '@/components/dashboard/dashboard-profile-card';
import { RideInfoCard } from '@/components/dashboard/ride-info-card';
import { DashboardActionsCard } from '@/components/dashboard/dashboard-actions-card';
import { QnaSection } from '@/components/qna-section';


type ViewState = 'rider' | 'organizer' | null;

const DashboardSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-9 w-1/2" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    </div>
);

export default function DashboardPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [registrationData, setRegistrationData] = useState<Registration | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>(null);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const unsubscribes: (() => void)[] = [];

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData({ id: doc.id, ...doc.data() } as AppUser);
                    }
                });
                unsubscribes.push(unsubUser);

                const regDocRef = doc(db, 'registrations', user.uid);
                const unsubReg = onSnapshot(regDocRef, (doc) => {
                    if (doc.exists()) {
                        setRegistrationData({ id: doc.id, ...doc.data() } as Registration);
                    } else {
                        setRegistrationData(null);
                    }
                });
                unsubscribes.push(unsubReg);

            } catch (err) {
                console.error("Error setting up listeners:", err);
                setFetchError("Failed to load your details. Please try again later.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [user, loading, router]);


    const handleRegistrationSuccess = (newData: Registration) => {
        setRegistrationData(newData);
        setView(null);
    }
    
    const handleOrganizerRequestSuccess = (newUserData: AppUser) => {
        setUserData(newUserData);
        setView(null);
    }
    
    const getRegistrationStatusContent = () => {
        if (!registrationData) return null;

        const notifyText = `Hi Telefun, I have registered for the ride. My details are:\nName: ${registrationData.fullName}\nRegistration ID: ${registrationData.id}`;
        const whatsappUrl = `https://wa.me/916363148287?text=${encodeURIComponent(notifyText)}`;

        switch (registrationData.status) {
            case 'approved':
                return <DigitalTicket registration={registrationData} user={user!} />;
            case 'pending':
                return (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Clock className="text-primary"/> Registration Pending
                            </CardTitle>
                            <CardDescription>
                                Your registration is being reviewed. For faster approval, you can notify us.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild>
                                <Link href={whatsappUrl} target="_blank">
                                    <Send className="w-4 h-4 mr-2" />
                                    Notify Telefun via WhatsApp
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                );
            case 'rejected':
                return (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                                <Ban /> Registration Rejected
                            </Title>
                            <CardDescription>
                                Unfortunately, your registration could not be approved. If you believe this is an error, please contact the event organizers.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            case 'cancellation_requested':
                return (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Clock className="text-primary"/> Cancellation Pending
                            </Title>
                            <CardDescription>
                                Your request to cancel your registration has been submitted and is pending review by an admin.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            default:
                return null;
        }
    }


    const renderContent = () => {
        if (view === 'rider') return <RegistrationForm onSuccess={handleRegistrationSuccess} />;
        if (view === 'organizer') return <OrganizerAgreementForm onSuccess={handleOrganizerRequestSuccess} />;

        if (!registrationData) {
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to the Ride!</CardTitle>
                        <CardDescription>
                            How would you like to participate? Register as a rider or volunteer as an organizer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <button onClick={() => setView('rider')} className="relative rounded-lg border bg-background p-6 hover:bg-accent hover:text-accent-foreground group flex flex-col items-center justify-center h-full text-center">
                            <Ticket className="h-8 w-8 text-primary mb-4" />
                            <h3 className="font-semibold">Register as a Rider</h3>
                            <p className="text-sm text-muted-foreground mt-1">Join the ride and get your digital ticket.</p>
                        </button>
                         <button onClick={() => setView('organizer')} className="relative rounded-lg border bg-background p-6 hover:bg-accent hover:text-accent-foreground group flex flex-col items-center justify-center h-full text-center">
                            <Shield className="h-8 w-8 text-primary mb-4" />
                            <h3 className="font-semibold">Request Organizer Access</h3>
                            <p className="text-sm text-muted-foreground mt-1">Help manage the event as a volunteer.</p>
                        </button>
                    </CardContent>
                </Card>
            );
        }

        const registrationStatusContent = getRegistrationStatusContent();

        return (
             <Tabs defaultValue="ticket" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ticket"><Ticket className="w-4 h-4 mr-2" />My Ticket</TabsTrigger>
                    <TabsTrigger value="community"><MessageSquare className="w-4 h-4 mr-2" />Community Hub</TabsTrigger>
                    <TabsTrigger value="actions"><ListChecks className="w-4 h-4 mr-2" />Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="ticket" className="space-y-4">
                    {registrationStatusContent}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DashboardProfileCard user={userData} registration={registrationData} />
                        <RideInfoCard />
                    </div>
                </TabsContent>
                <TabsContent value="community" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Community & Support</CardTitle>
                            <CardDescription>Connect with other riders and get help.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                                <Link href="https://chat.whatsapp.com/B9glPPTpS1oIZD6fN8AeX4" target="_blank">Join WhatsApp Group</Link>
                            </Button>
                             <Button asChild className="w-full" variant="outline">
                                <Link href="https://wa.me/916363148287" target="_blank">Contact Organizers on WhatsApp</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <QnaSection />
                </TabsContent>
                <TabsContent value="actions">
                    <DashboardActionsCard registration={registrationData} />
                </TabsContent>
            </Tabs>
        )
    };
    
    if (loading || isLoadingData) {
        return (
            <div className="flex flex-col min-h-screen bg-secondary/50">
                <Header />
                 <main className="flex-grow container mx-auto p-4 md:p-8">
                    <div className="w-full max-w-4xl mx-auto">
                        <DashboardSkeleton />
                    </div>
                </main>
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

    if (userData && (userData.role === 'admin' || userData.role === 'superadmin' || userData.role === 'viewer')) {
        return (
            <div className="flex flex-col min-h-screen bg-secondary/50">
                <Header />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                     <Card className="text-center w-full max-w-md">
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
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="w-full max-w-4xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold font-headline">
                      Your Dashboard
                    </h1>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

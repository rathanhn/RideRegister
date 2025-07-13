
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Header } from '@/components/header';
import { Loader2, AlertTriangle, Shield, ArrowRight, Ban, Clock, Ticket, MessageSquare, ListChecks, MessageCircle, Instagram } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Registration, AppUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { DigitalTicket } from '@/components/digital-ticket';
import { DashboardProfileCard } from '@/components/dashboard/dashboard-profile-card';
import { RideInfoCard } from '@/components/dashboard/ride-info-card';
import { DashboardActionsCard } from '@/components/dashboard/dashboard-actions-card';
import { QnaSection } from '@/components/qna-section';

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

    useEffect(() => {
        if (loading) return;
        if (!user) {
            console.log("[Dashboard] User not logged in. Redirecting to login.");
            const currentParams = new URLSearchParams(window.location.search);
            router.push(`/login?${currentParams.toString()}`);
            return;
        }

        console.log("[Dashboard] User is logged in. Fetching data...");
        const unsubscribes: (() => void)[] = [];

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData({ id: doc.id, ...doc.data() } as AppUser);
                    } else {
                        // This case can happen if a user is authenticated but their user doc is not yet created.
                        // We can either log them out or wait. For now, we'll just not set user data.
                        console.warn(`User document not found for UID: ${user.uid}`);
                        setUserData(null);
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

    const getRegistrationStatusContent = () => {
        if (!registrationData) return null;

        switch (registrationData.status) {
            case 'approved':
                return <DigitalTicket registration={registrationData} user={user!} />;
            case 'pending':
                const names = registrationData.registrationType === 'duo' 
                    ? `${registrationData.fullName} & ${registrationData.fullName2}` 
                    : registrationData.fullName;
                const message = `Hi Team Telefun, please review my registration.\n\nName(s): ${names}\nRegistration ID: ${registrationData.id}`;
                const whatsappUrl = `https://wa.me/916363148287?text=${encodeURIComponent(message)}`;

                return (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-2">
                                <Clock className="w-12 h-12 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Registration Pending Review</CardTitle>
                            <CardDescription className="mt-2 max-w-md mx-auto">
                                Thank you for registering! Your application has been submitted successfully and is now awaiting approval from an event organizer. You will be notified once your status is updated.
                            </CardDescription>
                            <Button asChild className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                                <Link href={whatsappUrl} target="_blank">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Notify Team Telefun
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
                            </CardTitle>
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
                            </CardTitle>
                            <CardDescription>
                                Your request to cancel your registration has been submitted and is pending review by an admin.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            case 'cancelled':
                 return (
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                                <Ban /> Registration Cancelled
                            </CardTitle>
                            <CardDescription>
                               Your registration for this event has been cancelled as per your request.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                );
            default:
                return null;
        }
    }

    const renderContent = () => {
        if (!registrationData) {
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to the Ride!</CardTitle>
                        <CardDescription>
                            You're logged in, but you haven't registered for the ride yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/register">
                                <Ticket className="h-4 w-4 mr-2" />
                                Register as a Rider
                            </Link>
                        </Button>
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
                            <Button asChild className="w-full" variant="outline">
                                <Link href="https://www.instagram.com/telefun_" target="_blank"><Instagram className="mr-2 h-4 w-4" />Follow on Instagram</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <QnaSection />
                </TabsContent>
                <TabsContent value="actions">
                    <DashboardActionsCard registration={registrationData} user={userData}/>
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

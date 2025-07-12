
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';
import { Header } from '@/components/header';
import { Loader2, AlertTriangle, Ticket } from 'lucide-react';
import { SingleTicket } from '@/components/digital-ticket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicTicketPage({ params }: { params: { id: string } }) {
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { id } = params;
        if (!id) {
            setError("No ticket ID provided.");
            setLoading(false);
            return;
        }

        const fetchTicket = async () => {
            try {
                const regDocRef = doc(db, 'registrations', id);
                const regDoc = await getDoc(regDocRef);

                if (regDoc.exists()) {
                    const data = { id: regDoc.id, ...regDoc.data() } as Registration;
                    if (data.status === 'approved') {
                        setRegistration(data);
                    } else {
                        setError("This ticket is not currently valid or has been cancelled.");
                    }
                } else {
                    setError("This ticket could not be found.");
                }
            } catch (err) {
                console.error("Error fetching ticket:", err);
                setError("An error occurred while trying to load the ticket.");
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [params]);
    
    const renderTicket = () => {
        if (!registration) return null;

        if (registration.registrationType === 'duo') {
            return (
                <div className="space-y-4">
                    <SingleTicket registration={registration} riderNumber={1} />
                    <SingleTicket registration={registration} riderNumber={2} />
                </div>
            )
        }
        
        return <SingleTicket registration={registration} riderNumber={1} />
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-xl mx-auto space-y-4">
                    {loading && (
                        <Card className="text-center">
                           <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground">Loading Ticket...</p>
                           </CardContent>
                        </Card>
                    )}
                    {error && (
                         <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2 text-destructive"><AlertTriangle /> Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <p>{error}</p>
                            </CardContent>
                        </Card>
                    )}
                    {registration && (
                         <div className="space-y-4">
                            <Card className="bg-green-50 border-green-200 text-green-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Ticket /> Public Ticket View</CardTitle>
                                    <CardDescription className="text-green-800">
                                        This is a shareable, public link to a ride ticket.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                             {renderTicket()}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

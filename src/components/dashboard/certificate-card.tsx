
"use client";

import React, { useState, useEffect } from 'react';
import type { AppUser, Registration } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface CertificateCardProps {
    user: AppUser;
    registration: Registration;
}

export function CertificateCard({ user, registration }: CertificateCardProps) {
    const { toast } = useToast();
    const [isSharing, setIsSharing] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // This ensures the code only runs on the client, after hydration
        setOrigin(window.location.origin);
    }, []);

    // FIX: Use the photo from the registration data, not the user profile, to match admin logic.
    const riderName = registration.fullName;
    const riderPhotoUrl = registration.photoURL || '';

    const certificatePreviewUrl = origin ? new URL(`${origin}/certificate-preview`) : null;
    if (certificatePreviewUrl) {
      certificatePreviewUrl.searchParams.set('name', riderName);
      certificatePreviewUrl.searchParams.set('photo', riderPhotoUrl);
      certificatePreviewUrl.searchParams.set('regId', registration.id);
    }
    
    const handleShare = async () => {
        if (!certificatePreviewUrl) return;

        if (navigator.share) {
            setIsSharing(true);
            try {
                await navigator.share({
                    title: 'TeleFun Freedom Ride Certificate',
                    text: `I completed the TeleFun Freedom Ride! Here's my certificate.`,
                    url: certificatePreviewUrl.toString(),
                });
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.error(e);
                    toast({ variant: 'destructive', title: 'Share Failed', 'description': 'Could not share the certificate.' });
                }
            } finally {
                setIsSharing(false);
            }
        } else {
            toast({ title: 'Share Not Supported', description: 'Your browser does not support the Web Share API.' });
        }
    };

    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Certificate of Completion</CardTitle>
                <CardDescription>
                    Congratulations on completing the ride! Download or share your certificate below.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
                {!origin ? (
                    <div className="w-full flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    </div>
                ) : (
                    <>
                        <Button asChild className="w-full">
                            <Link href={certificatePreviewUrl?.toString() || ''} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download / View
                            </Link>
                        </Button>
                        {navigator.share && (
                            <Button onClick={handleShare} disabled={isSharing} variant="outline" className="w-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Certificate
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

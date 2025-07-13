
"use client";

import type { User } from 'firebase/auth';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bike, CheckCircle, Users, User as UserIcon, Share2, AlertTriangle, Link as LinkIcon, Calendar, Clock, MapPin, Phone, Loader2, Sparkles } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Logo from '@/Logo.png';
import html2canvas from 'html2canvas';


interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

interface SingleTicketProps {
  registration: Registration;
  riderNumber: 1 | 2;
  userEmail?: string | null;
  ticketRef: React.RefObject<HTMLDivElement>;
}

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

export function SingleTicket({ registration, riderNumber, userEmail, ticketRef }: SingleTicketProps) {
  const isDuo = registration.registrationType === 'duo';
  const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
  const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
  const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
  const photoUrl = riderNumber === 1 ? registration.photoURL : registration.photoURL2;

  const qrData = JSON.stringify({
    registrationId: registration.id,
    rider: riderNumber,
  });

  return (
    <div ref={ticketRef} className="bg-[#09090b] text-white rounded-lg shadow-2xl border border-primary/20 overflow-hidden font-body">
        <div className="p-4 bg-muted/10 relative">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
                 <div>
                    <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                    <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                 </div>
              </div>
           </div>
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />
        </div>
        
        <div className="p-4 flex flex-col items-center text-center gap-4">
            <Avatar className="h-28 w-28 border-4 border-primary/50">
                <AvatarImage src={photoUrl || undefined} alt={riderName || 'Rider'} />
                <AvatarFallback><UserIcon className="w-14 h-14" /></AvatarFallback>
            </Avatar>
            
            <div>
                <h4 className="font-bold text-2xl">{riderName}</h4>
                <p className="text-sm text-muted-foreground">{riderPhone}</p>
            </div>
            
             <div className="grid grid-cols-2 gap-x-8 pt-2">
                 <div className="text-center">
                    <p className="font-semibold text-muted-foreground text-xs">Reg. Type</p>
                    <div className="flex items-center gap-1 mt-1 justify-center">
                        {registration.registrationType === 'solo' ? <Bike className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <h4 className="font-semibold capitalize">{registration.registrationType}</h4>
                    </div>
                 </div>
                 <div className="text-center">
                    <p className="font-semibold text-muted-foreground text-xs">Check-in</p>
                     <Badge variant={isCheckedIn ? 'default' : 'secondary'} className={`mt-1 ${isCheckedIn ? 'bg-green-600' : ''}`}>
                         {isCheckedIn ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                         {isCheckedIn ? 'Checked-in' : 'Pending'}
                      </Badge>
                 </div>
            </div>
            
            <div className="w-[120px] h-[120px] p-2 bg-white rounded-md flex items-center justify-center border mt-2">
                <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={110} height={110} />
            </div>
             <div className="mt-1 flex flex-col items-center gap-1">
                <p className="text-xs text-muted-foreground">Reg. ID</p>
                <p className="font-mono text-sm font-bold tracking-tighter">{registration.id.substring(0, 10).toUpperCase()}</p>
            </div>
        </div>

        <div className="bg-muted/10 p-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Date</p>
                        <p className="text-sm text-muted-foreground">August 15, 2025</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Time</p>
                        <p className="text-sm text-muted-foreground">6:00 AM Assembly</p>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-muted-foreground">Telefun Mobiles, Mahadevpet, Madikeri</p>
                </div>
            </div>
        </div>
      </div>
  );
}


export function DigitalTicket({ registration, user }: DigitalTicketProps) {
  const { toast } = useToast();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const ticketRef1 = useRef<HTMLDivElement>(null);
  const ticketRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.share && navigator.canShare) {
      setIsShareSupported(true);
    }
  }, []);

  const shareUrl = `${window.location.origin}/ticket/${registration.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ 
        title: 'Link Copied!', 
        description: 'A shareable link to your ticket has been copied.',
        action: <LinkIcon className="text-primary" />,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the link.' });
    }
  };

  const handleWebShare = async () => {
    setIsSharing(true);
    // Determine which ticket to share based on carousel position
    const currentSlide = carouselApi?.selectedScrollSnap() ?? 0;
    const ticketRef = currentSlide === 0 ? ticketRef1 : ticketRef2;
    const riderName = currentSlide === 0 ? registration.fullName : registration.fullName2;

    if (!ticketRef.current) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the ticket to share.' });
        setIsSharing(false);
        return;
    }

    try {
        const canvas = await html2canvas(ticketRef.current, { 
            useCORS: true, 
            backgroundColor: '#09090b', // Explicitly set background color
        });
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        
        if (!blob) {
            throw new Error("Could not create image from ticket.");
        }

        const file = new File([blob], `telefun-ride-ticket-${riderName}.png`, { type: 'image/png' });
        const shareData = {
            files: [file],
            title: `TeleFun Ride Ticket: ${riderName}`,
            text: `I've registered for the TeleFun Mobiles Independence Day Ride! See you there! @telefun_ #RideRegister`,
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
             throw new Error("Your browser cannot share this file type.");
        }
    } catch (error: any) {
         // AbortError is thrown when the user cancels the share dialog, which is not an actual error.
        if (error.name === 'AbortError') {
          console.log('Share was cancelled by the user.');
        } else {
            console.error("Share error:", error);
            toast({
                variant: 'destructive',
                title: 'Share Failed',
                description: 'An error occurred while trying to share. Try copying the link instead.'
            });
        }
    } finally {
        setIsSharing(false);
    }
  };

  const ticketContainer = (
    registration.registrationType === 'duo' ? (
        <Carousel setApi={setCarouselApi} className="w-full max-w-xl mx-auto">
          <CarouselContent>
            <CarouselItem>
              <SingleTicket registration={registration} riderNumber={1} userEmail={user.email} ticketRef={ticketRef1}/>
            </CarouselItem>
            <CarouselItem>
              <SingleTicket registration={registration} riderNumber={2} userEmail={user.email} ticketRef={ticketRef2}/>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-[-10px] sm:left-[-20px] h-8 w-8" />
          <CarouselNext className="right-[-10px] sm:right-[-20px] h-8 w-8" />
        </Carousel>
    ) : (
       <div className="max-w-xl mx-auto">
          <SingleTicket registration={registration} riderNumber={1} userEmail={user.email} ticketRef={ticketRef1} />
      </div>
    )
  );

  return (
    <div className="space-y-6">
      {ticketContainer}
      <div className="max-w-xl mx-auto space-y-4">
         <div className="w-full text-center p-4 border-2 border-dashed border-primary/50 rounded-lg bg-secondary/30 space-y-3">
             <h4 className="font-bold text-lg flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Share Your Excitement!
             </h4>
             <p className="text-sm text-muted-foreground">
                Post your ticket on social media and tag <strong className="text-primary">@telefun_</strong> to be featured!
             </p>
             <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
                {isShareSupported && (
                    <Button onClick={handleWebShare} className="w-full" disabled={isSharing}>
                        {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Share2 className="mr-2 h-4 w-4" />}
                        {isSharing ? 'Preparing...' : 'Share Ticket Image'}
                    </Button>
                )}
                <Button onClick={handleCopyLink} variant="outline" className="w-full" disabled={isSharing}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Sharable Link
                </Button>
            </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground p-3 border rounded-lg">
            <div className="flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <p>
                    <strong>Tip:</strong> Take a screenshot of your ticket for offline access.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

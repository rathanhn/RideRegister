
"use client";

import type { User } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bike, CheckCircle, Users, User as UserIcon, AlertTriangle, Calendar, Clock, MapPin, Sparkles, Clipboard, Eye, Loader2, Download, Instagram, Share2 } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Logo from '@/Logo.png';
import Link from 'next/link';
import { useEventSettings } from '@/hooks/use-event-settings';
import { format } from 'date-fns';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';


interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

interface SingleTicketProps {
  id: string;
  registration: Registration;
  riderNumber: 1 | 2;
  userEmail?: string | null;
}

// Function to generate image data from the ticket element
const generateImageDataUrl = async (node: HTMLElement): Promise<string> => {
    // Use toCanvas to have more control and avoid font/CORS issues
    const canvas = await htmlToImage.toCanvas(node, {
        pixelRatio: 3,
        useCORS: true,
        skipAutoScale: true, // Prevents issues with scaling
        skipFonts: true, // Prevents errors from trying to inline Google Fonts
    });
    return canvas.toDataURL('image/png', 1.0);
};


const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

export function SingleTicket({ id, registration, riderNumber }: SingleTicketProps) {
  const isDuo = registration.registrationType === 'duo';
  const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
  const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
  const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
  const photoUrl = riderNumber === 1 ? registration.photoURL : registration.photoURL2;
  const { settings, loading } = useEventSettings();

  const qrData = JSON.stringify({
    registrationId: registration.id,
    rider: riderNumber,
  });

  return (
    <div id={id} className="bg-[#09090b] text-white rounded-lg shadow-2xl border border-primary/20 overflow-hidden font-body">
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
            
            {loading ? (
                 <div className="flex justify-center items-center h-12 w-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
             <div className="w-full grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-white/10">
                <div className="flex flex-col items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                         {settings.startTime ? format(settings.startTime, 'MMM d, yyyy') : 'TBD'}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                        {settings.startTime ? format(settings.startTime, 'p') : 'TBD'}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{settings.originShort || 'TBD'}</span>
                </div>
            </div>
            )}
            
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
                <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={110} height={110} unoptimized/>
            </div>
             <div className="mt-1 flex flex-col items-center gap-1">
                <p className="text-xs text-muted-foreground">Reg. ID</p>
                <p className="font-mono text-sm font-bold tracking-tighter">{registration.id.substring(0, 10).toUpperCase()}</p>
            </div>
        </div>
      </div>
  );
}


function TicketActions({ riderNumber, registration }: { riderNumber: 1 | 2, registration: Registration }) {
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isShareApiSupported, setIsShareApiSupported] = useState(false);

    useEffect(() => {
        if (navigator.share && navigator.canShare) {
            setIsShareApiSupported(true);
        }
    }, []);

    const shareUrl = `${window.location.origin}/ticket/${registration.id}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({ 
                title: 'Link Copied!', 
                description: 'A shareable link to your ticket has been copied.',
                action: <Clipboard className="text-primary" />,
            });
        } catch (error) {
           toast({ variant: 'destructive', title: 'Copy Failed', 'description': 'Could not copy the link.' });
        }
    };

    const handleDownload = async () => {
        const ticketId = `ticket-${riderNumber}`;
        const node = document.getElementById(ticketId);
        if (!node) return;

        setIsDownloading(true);

        try {
            const dataUrl = await generateImageDataUrl(node);
            const pdf = new jsPDF({
                orientation: 'p', unit: 'px', format: [node.offsetWidth, node.offsetHeight]
            });
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            
            const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
            pdf.save(`${riderName}-ticket.pdf`);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Download Failed', 'description': 'Could not download the ticket.' });
        } finally {
            setIsDownloading(null);
        }
    }

    const handleShare = async () => {
        const ticketId = `ticket-${riderNumber}`; 
        const node = document.getElementById(ticketId);
        if (!node) return;
        
        setIsSharing(true);
        
        try {
            const dataUrl = await generateImageDataUrl(node);
            const blob = await (await fetch(dataUrl)).blob();
            const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
            const file = new File([blob], `${riderName}-ticket.png`, { type: blob.type });

            if (isShareApiSupported && navigator.canShare({ files: [file] })) {
                 await navigator.share({
                    title: 'TeleFun Freedom Ride Ticket',
                    text: `Here's my ticket for the TeleFun Freedom Ride!`,
                    files: [file],
                });
            } else {
                 const link = document.createElement('a');
                 link.download = `${riderName}-freedom-ride-ticket.png`;
                 link.href = dataUrl;
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 toast({
                     title: 'Image Saved!',
                     description: "Your browser doesn't support direct sharing, so the ticket image has been downloaded. You can share it manually!",
                 });
            }

        } catch (e: any) {
            if (e.name !== 'AbortError') { // Don't show error if user cancelled share
                 console.error(e);
                toast({ variant: 'destructive', title: 'Share Failed', 'description': 'Could not share the ticket image.' });
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="w-full text-center p-4 border-2 border-dashed border-primary/50 rounded-lg bg-secondary/30 space-y-3">
             <h4 className="font-bold text-lg flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Actions for {registration.registrationType === 'duo' ? `Rider ${riderNumber}` : 'your Ticket'}
             </h4>
             <p className="text-sm text-muted-foreground">
                Save your ticket for offline access or share it with friends!
             </p>
             <div className="w-full flex flex-col gap-2 pt-2">
                 <Button onClick={handleDownload} variant="outline" className="w-full" disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                    Download Ticket (PDF)
                </Button>
                 <Button onClick={handleShare} disabled={isSharing} variant="outline" className="w-full">
                    {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Instagram className="mr-2 h-4 w-4" />}
                    Share to Instagram Story
                </Button>
            </div>
            <div className="w-full flex flex-col gap-2 pt-2">
                <Button asChild variant="outline" className="w-full">
                    <Link href={shareUrl} target="_blank">
                        <Eye className="mr-2 h-4 w-4" />
                        View Public Link
                    </Link>
                </Button>
                <Button onClick={handleCopyLink} variant="outline" className="w-full">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy Link
                </Button>
            </div>
        </div>
    );
}


export function DigitalTicket({ registration, user }: DigitalTicketProps) {

  return (
    <div className="space-y-6">
       <Carousel className="w-full max-w-sm mx-auto">
        <CarouselContent>
           <CarouselItem>
              <div className="p-1">
                 <div className="space-y-4">
                    <SingleTicket id="ticket-1" registration={registration} riderNumber={1} />
                    <TicketActions registration={registration} riderNumber={1}/>
                </div>
              </div>
            </CarouselItem>
           {registration.registrationType === 'duo' && (
             <CarouselItem>
              <div className="p-1">
                 <div className="space-y-4">
                    <SingleTicket id="ticket-2" registration={registration} riderNumber={2} />
                    <TicketActions registration={registration} riderNumber={2}/>
                </div>
              </div>
            </CarouselItem>
           )}
        </CarouselContent>
         {registration.registrationType === 'duo' && (
            <>
                <CarouselPrevious className="left-[-10px] sm:left-[-20px] h-8 w-8" />
                <CarouselNext className="right-[-10px] sm:right-[-20px] h-8 w-8" />
            </>
         )}
      </Carousel>

      <div className="max-w-sm mx-auto">
        <div className="text-center text-sm text-muted-foreground p-3 border rounded-lg">
            <div className="flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <p>
                    <strong>Tip:</strong> Take a screenshot of your ticket for easy offline access.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

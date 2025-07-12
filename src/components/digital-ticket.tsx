
"use client";

import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/Logo.png";
import Image from 'next/image';
import { Bike, CheckCircle, Users, Download, Phone, User as UserIcon, Loader2, Calendar, Clock, MapPin, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

interface SingleTicketProps {
  registration: Registration;
  riderNumber: 1 | 2;
  user: User;
}

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

// Helper to fetch an image and convert it to a Base64 Data URI
const toDataURL = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  } catch (error) {
     // Fallback to proxy for potential CORS issues
     console.warn("Direct image fetch failed, trying proxy. Error:", error);
     const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
     const proxyResponse = await fetch(proxyUrl);
     if (!proxyResponse.ok) {
        throw new Error(`Proxy fetch failed: ${proxyResponse.status} ${proxyResponse.statusText}`);
     }
     const blob = await proxyResponse.blob();
     return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }
};

const SingleTicket = React.forwardRef<HTMLDivElement, SingleTicketProps>(({ registration, riderNumber, user }, ref) => {
  const isDuo = registration.registrationType === 'duo';
  const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
  const riderAge = riderNumber === 1 ? registration.age : registration.age2;
  const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
  const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
  const photoUrl = riderNumber === 1 ? registration.photoURL : registration.photoURL2;

  const qrData = JSON.stringify({
    registrationId: registration.id,
    rider: riderNumber,
  });

  return (
    <div ref={ref}>
      <Card className="max-w-md mx-auto bg-card shadow-2xl overflow-hidden border-2 border-primary/20">
        <CardHeader className="p-4 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="relative h-12 w-12 rounded-full border border-primary/20 flex-shrink-0 flex items-center justify-center bg-white p-1 overflow-hidden">
                <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={registration.status === 'approved' ? 'default' : 'destructive'} className="capitalize"><ShieldCheck className="mr-1 h-3 w-3"/>{registration.status}</Badge>
              {isCheckedIn ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" /> Checked-in
                </Badge>
              ) : (
                <Badge variant="secondary">Not Checked-in</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <CardTitle className="text-xl md:text-2xl font-headline">
              Your Ride Ticket {isDuo ? `(Rider ${riderNumber} of 2)` : ''}
            </CardTitle>
            <CardDescription>Present this ticket at the check-in counter.</CardDescription>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="flex items-start gap-3">
                 <Avatar className="h-16 w-16 border-2 border-primary/50">
                    <AvatarImage src={photoUrl || undefined} alt={riderName || 'Rider'} />
                    <AvatarFallback><UserIcon className="w-8 h-8" /></AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h4 className="font-bold text-base md:text-lg">{riderName}</h4>
                    <p className="text-sm text-muted-foreground">{riderAge} years</p>
                    <div className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {riderPhone}</div>
                </div>
              </div>

              <div className="flex gap-8 pt-2">
                <div>
                  <h4 className="font-semibold text-muted-foreground text-sm">Reg. Type</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {registration.registrationType === 'solo' ? <Bike className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    <p className="font-bold text-base md:text-lg capitalize">
                      {registration.registrationType}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground text-sm">Reg. ID</h4>
                  <p className="font-mono text-xs md:text-base pt-1">{registration.id.substring(0, 10).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-[120px] h-[120px] p-2 bg-white rounded-md flex items-center justify-center">
                <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={110} height={110} />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div className="flex items-start gap-2"><Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Date</p><p className="text-muted-foreground">August 15, 2025</p></div></div>
            <div className="flex items-start gap-2"><Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Assembly Time</p><p className="text-muted-foreground">6:00 AM</p></div></div>
            <div className="flex items-start gap-2 col-span-2"><MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Starting Point</p><p className="text-muted-foreground">Telefun Mobiles: Mahadevpet, Madikeri</p></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
SingleTicket.displayName = 'SingleTicket';

export function DigitalTicket({ registration, user }: DigitalTicketProps) {
  const { toast } = useToast();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const currentSlide = carouselApi?.selectedScrollSnap() ?? 0;
        const riderNumber = (currentSlide + 1) as 1 | 2;
        const riderName = riderNumber === 1 ? registration.fullName : (registration.fullName2 || 'Rider 2');
        const riderAge = riderNumber === 1 ? registration.age : registration.age2;
        const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
        const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
        const photoUrl = riderNumber === 1 ? registration.photoURL : registration.photoURL2;

        const qrData = JSON.stringify({
            registrationId: registration.id,
            rider: riderNumber,
        });

        // Pre-fetch images
        const logoDataUrl = Logo.src; 
        const qrCodeDataUrl = await toDataURL(generateQrCodeUrl(qrData));
        let riderPhotoDataUrl: string | null = null;
        if (photoUrl) {
            try {
                riderPhotoDataUrl = await toDataURL(photoUrl);
            } catch (e) {
                console.error("Could not fetch rider photo for PDF, will skip.", e);
                toast({
                    variant: 'destructive',
                    title: 'Photo Skipped',
                    description: 'Could not load the profile photo for the PDF.'
                })
            }
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'px', format: [350, 500] });

        const primaryColor = '#FF9933';
        const textColor = '#1A202C';
        const mutedColor = '#64748B';

        // --- Drawing the ticket ---
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.5);
        
        // Header Background
        doc.setFillColor(255, 247, 237); // primary/10
        doc.roundedRect(6, 6, 338, 55, 8, 8, 'F');
        
        doc.setFillColor(255, 255, 255);
        doc.rect(6, 50, 338, 20, 'F');
        
        doc.roundedRect(5, 5, 340, 490, 8, 8, 'S');

        // --- Header Content ---
        doc.addImage(logoDataUrl, 'PNG', 15, 16, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.setFontSize(12);
        doc.text('TeleFun Mobile', 55, 28);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor);
        doc.setFontSize(9);
        doc.text('Independence Day Ride 2025', 55, 42);

        // --- Status Badges ---
        doc.setFillColor(registration.status === 'approved' ? primaryColor : '#E53E3E');
        doc.roundedRect(260, 15, 75, 14, 7, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(registration.status.toUpperCase(), 300, 24, { align: 'center' });

        doc.setFillColor(isCheckedIn ? '#C6F6D5' : '#E2E8F0');
        doc.roundedRect(260, 33, 75, 14, 7, 7, 'F');
        doc.setTextColor(isCheckedIn ? '#22543D' : '#4A5568');
        doc.text(isCheckedIn ? 'CHECKED-IN' : 'NOT CHECKED-IN', 300, 42, { align: 'center' });
        
        // --- Main Content ---
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.setFontSize(18);
        doc.text('Your Ride Ticket', 20, 85);
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text('Present this ticket at the check-in counter.', 20, 98);

        // --- Rider Details ---
        const photoX = 45;
        const photoY = 140;
        const photoRadius = 25;
        
        if (riderPhotoDataUrl) {
            const imgFormat = riderPhotoDataUrl.substring(riderPhotoDataUrl.indexOf('/') + 1, riderPhotoDataUrl.indexOf(';'));
            doc.save();
            doc.beginPath();
            doc.arc(photoX, photoY, photoRadius, 0, Math.PI * 2, true);
            doc.closePath();
            doc.clip();
            doc.addImage(riderPhotoDataUrl, imgFormat.toUpperCase(), photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
            doc.restore();
        } else {
            // Draw a fallback circle
            doc.setFillColor(226, 232, 240); // muted color
            doc.circle(photoX, photoY, photoRadius, 'F');
        }
        
        const textStartX = 80;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text(`${riderName}, ${riderAge} years`, textStartX, 138);
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text(riderPhone || '', textStartX, 152);
        
        // --- Reg Type & ID ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mutedColor);
        doc.text('Reg. Type', 20, 190);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text(registration.registrationType.charAt(0).toUpperCase() + registration.registrationType.slice(1), 20, 205);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mutedColor);
        doc.text('Reg. ID', 120, 190);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.text(registration.id.substring(0, 10).toUpperCase(), 120, 205);
        
        // --- QR Code ---
        doc.addImage(qrCodeDataUrl, 'PNG', 220, 120, 100, 100);

        // --- Separator ---
        doc.setDrawColor(226, 232, 240); // border color
        doc.setLineWidth(0.5);
        doc.line(20, 240, 330, 240);

        // --- Footer Details ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Date', 20, 260);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor);
        doc.text('August 15, 2025', 20, 275);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Assembly Time', 180, 260);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor);
        doc.text('6:00 AM', 180, 275);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Starting Point', 20, 300);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor);
        doc.text('Telefun Mobiles: Mahadevpet, Madikeri', 20, 315);
        
        doc.save(`RideRegister-Ticket-${riderName.replace(/ /g, '_')}.pdf`);
        
    } catch(err) {
        console.error("Error generating PDF:", err);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'There was an issue creating the PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href; // URL to the dashboard
    const shareText = "Check out my ride ticket for the Independence Day Freedom Ride! You can register here: https://rideregister.web.app";

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RideRegister Ticket',
          text: shareText,
          url: shareUrl,
        });
        toast({ title: 'Shared successfully!' });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ variant: 'destructive', title: 'Could not share', description: 'There was an error trying to share your ticket.' });
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link Copied!', description: 'The link to your dashboard has been copied to your clipboard.' });
      } catch (error) {
         toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the link to your clipboard.' });
      }
    }
  };

  const ticketContainer = (
    registration.registrationType === 'duo' ? (
        <Carousel setApi={setCarouselApi} className="w-full max-w-md mx-auto">
          <CarouselContent>
            <CarouselItem>
              <SingleTicket registration={registration} riderNumber={1} user={user} />
            </CarouselItem>
            <CarouselItem>
              <SingleTicket registration={registration} riderNumber={2} user={user} />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-[-10px] sm:left-[-20px] h-8 w-8" />
          <CarouselNext className="right-[-10px] sm:right-[-20px] h-8 w-8" />
        </Carousel>
    ) : (
      <SingleTicket registration={registration} riderNumber={1} user={user} />
    )
  );

  return (
    <div className="space-y-4">
      {ticketContainer}
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row w-full gap-4">
            <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Ticket
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Ticket
            </Button>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2 p-4 border border-dashed rounded-lg w-full">
            <div className="flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <p>
                    <strong>Important:</strong> A digital or printed copy of your ticket is required for check-in.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

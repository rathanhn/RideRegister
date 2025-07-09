
"use client";

import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/Logo.png";
import Image from 'next/image';
import { Bike, Calendar, Clock, MapPin, CheckCircle, Users, Download, Phone, User as UserIcon, Loader2 } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

interface SingleTicketProps {
  registration: Registration;
  riderNumber: 1 | 2;
}

// A simple function to generate a QR code placeholder URL
const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

const SingleTicket = React.forwardRef<HTMLDivElement, SingleTicketProps>(({ registration, riderNumber }, ref) => {
  const isDuo = registration.registrationType === 'duo';
  const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
  const riderAge = riderNumber === 1 ? registration.age : registration.age2;
  const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
  const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;

  const qrData = JSON.stringify({
    registrationId: registration.id,
    rider: riderNumber,
  });

  return (
    <div ref={ref}>
        <Card className="max-w-md mx-auto bg-card shadow-2xl overflow-hidden border-2 border-primary/20">
            <div className="bg-primary/10 p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="h-12 w-12 rounded-full border border-primary/20 flex-shrink-0 flex items-center justify-center overflow-hidden bg-white">
                      <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="object-contain" />
                    </div>
                    <div>
                        <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                        <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <Badge variant={registration.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{registration.status}</Badge>
                   {isCheckedIn ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1 py-1">
                            <CheckCircle className="h-3 w-3"/> Checked-in
                        </Badge>
                   ) : (
                        <Badge variant="secondary" className="flex items-center py-1">Not Checked-in</Badge>
                   )}
                </div>
            </div>
            <CardContent className="p-0">
                <div className="p-6">
                    <CardTitle className="text-2xl font-headline">
                        Your Ride Ticket {isDuo ? `(Rider ${riderNumber} of 2)` : ''}
                    </CardTitle>
                    <CardDescription>Present this ticket at the check-in counter.</CardDescription>
                </div>

                <div className="grid grid-cols-3 gap-6 p-6">
                    <div className="col-span-2 space-y-4">
                        <div className="space-y-2">
                             <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-2"><UserIcon className="h-4 w-4" /> Rider Details</h4>
                            <p className="font-bold text-lg">{riderName}, {riderAge} years</p>
                            <div className="text-sm text-muted-foreground" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone className="h-3 w-3" /> {riderPhone}</div>
                        </div>

                        <div className="flex gap-8 pt-2">
                            <div>
                                <h4 className="font-semibold text-muted-foreground text-sm">Reg. Type</h4>
                                <div className="mt-1" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {registration.registrationType === 'solo' ? <Bike className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                  <p className="font-bold text-lg">
                                      {registration.registrationType.charAt(0).toUpperCase() + registration.registrationType.slice(1)}
                                  </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-muted-foreground text-sm">Reg. ID</h4>
                                <p className="font-mono text-base pt-1">{registration.id.substring(0, 10).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                         <div className="w-[120px] h-[120px] p-2 bg-white rounded-md">
                            <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={120} height={120} />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Date</p><p className="text-muted-foreground">August 15, 2025</p></div></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Assembly Time</p><p className="text-muted-foreground">6:00 AM</p></div></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }} className="col-span-2"><MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Starting Point</p><p className="text-muted-foreground">Telefun Mobiles: Mahadevpet, Madikeri</p></div></div>
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

  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not found'));
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const currentSlide = registration.registrationType === 'duo' ? (carouselApi?.selectedScrollSnap() ?? 0) : 0;
        const riderNumber = (currentSlide + 1) as 1 | 2;
        const riderName = riderNumber === 1 ? registration.fullName : (registration.fullName2 || 'Rider2');
        const riderAge = riderNumber === 1 ? registration.age : registration.age2;
        const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
        const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
        const qrData = JSON.stringify({ registrationId: registration.id, rider: riderNumber });
        const qrUrl = generateQrCodeUrl(qrData);

        const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [350, 550] });

        // Colors and Fonts
        const primaryColor = '#FF9933'; 
        const textColor = '#1E293B';
        const mutedColor = '#64748B';

        // --- Drawing the ticket ---
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 340, 540, 'S'); // Outer border

        // Header
        doc.setFillColor(255, 247, 237); // A light orange, approximation of primary/10
        doc.rect(6, 6, 338, 50, 'F');

        const logoBase64 = await getBase64ImageFromURL(Logo.src);
        doc.addImage(logoBase64, 'PNG', 15, 12, 35, 35);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
        doc.text('TeleFun Mobile', 60, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor);
        doc.text('Independence Day Ride 2025', 60, 40);

        // Status Badges
        doc.setFillColor('#E2E8F0'); // secondary bg
        doc.roundedRect(250, 15, 85, 16, 8, 8, 'F');
        doc.setTextColor(textColor);
        doc.setFontSize(9);
        doc.text(`Status: ${registration.status.toUpperCase()}`, 255, 26);
        
        doc.setFillColor(isCheckedIn ? '#D1FAE5' : '#E2E8F0'); // green or secondary bg
        doc.roundedRect(250, 35, 85, 16, 8, 8, 'F');
        doc.setTextColor(isCheckedIn ? '#065F46' : textColor);
        doc.text(isCheckedIn ? 'Checked-in' : 'Not Checked-in', 255, 46);

        // Main content
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Your Ride Ticket', 15, 80);
        if(registration.registrationType === 'duo') {
            doc.setFontSize(12);
            doc.setTextColor(mutedColor);
            doc.text(`(Rider ${riderNumber} of 2)`, 150, 80);
        }

        // Rider Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Rider Details', 15, 110);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(`${riderName}, ${riderAge} years`, 15, 130);
        
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text(`Phone: ${riderPhone}`, 15, 145);

        // QR Code
        const qrBase64 = await getBase64ImageFromURL(qrUrl);
        doc.addImage(qrBase64, 'PNG', 220, 100, 110, 110);

        // Registration Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Registration Info', 15, 180);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Type: ${registration.registrationType.charAt(0).toUpperCase() + registration.registrationType.slice(1)}`, 15, 195);
        doc.text(`ID: ${registration.id.substring(0, 10).toUpperCase()}`, 15, 210);

        // Separator
        doc.setDrawColor(mutedColor);
        doc.setLineWidth(0.5);
        doc.line(15, 240, 335, 240);

        // Event Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text('Event Details', 15, 260);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text('Date:', 15, 275);
        doc.setTextColor(textColor);
        doc.text('August 15, 2025', 55, 275);

        doc.setTextColor(mutedColor);
        doc.text('Assembly:', 15, 290);
        doc.setTextColor(textColor);
        doc.text('6:00 AM', 55, 290);

        doc.setTextColor(mutedColor);
        doc.text('Location:', 15, 305);
        doc.setTextColor(textColor);
        doc.text('Telefun Mobiles: Mahadevpet, Madikeri', 15, 318, { maxWidth: 320 });
        
        doc.save(`RideRegister-Ticket-${riderName.replace(/ /g, '_')}.pdf`);

    } catch(err) {
        console.error("Error generating PDF:", err);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'There was an issue creating the PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };

  if (registration.registrationType === 'duo') {
    return (
        <div className="space-y-4">
            <Carousel setApi={setCarouselApi} className="w-full max-w-md mx-auto">
                <CarouselContent>
                    <CarouselItem>
                        <SingleTicket registration={registration} riderNumber={1} />
                    </CarouselItem>
                    <CarouselItem>
                         <SingleTicket registration={registration} riderNumber={2} />
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-[-10px] sm:left-[-50px]" />
                <CarouselNext className="right-[-10px] sm:right-[-50px]" />
            </Carousel>
             <div className="flex justify-center">
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Current Ticket
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
        <SingleTicket registration={registration} riderNumber={1} />
        <div className="flex justify-center">
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Ticket
            </Button>
        </div>
    </div>
  );
}

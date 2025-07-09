
"use client";

import type { User } from 'firebase/auth';
import React, { useState, useRef, createRef } from 'react';
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

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
}

// Helper to fetch an image and convert it to a Base64 Data URI
const toDataURL = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


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
    <div ref={ref} className="bg-card">
        <Card className="max-w-md mx-auto bg-card shadow-2xl overflow-hidden border-2 border-primary/20">
            <div className="bg-primary/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full border border-primary/20 flex-shrink-0 flex items-center justify-center overflow-hidden bg-white p-1">
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
                            <div className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {riderPhone}</div>
                        </div>

                        <div className="flex gap-8 pt-2">
                            <div>
                                <h4 className="font-semibold text-muted-foreground text-sm">Reg. Type</h4>
                                <div className="mt-1 flex items-center gap-2">
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
                         <div className="w-[120px] h-[120px] p-2 bg-white rounded-md flex items-center justify-center">
                            <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={110} height={110} />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
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
  const ticketRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  
  if (registration.registrationType === 'duo') {
    ticketRefs.current = [createRef<HTMLDivElement>(), createRef<HTMLDivElement>()];
  } else {
    ticketRefs.current = [createRef<HTMLDivElement>()];
  }
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const currentSlide = carouselApi?.selectedScrollSnap() ?? 0;
        const riderNumber = (currentSlide + 1) as 1 | 2;
        const riderName = riderNumber === 1 ? registration.fullName : (registration.fullName2 || 'Rider 2');
        const riderAge = riderNumber === 1 ? registration.age : registration.age2;
        const riderPhone = riderNumber === 1 ? registration.phoneNumber : registration.phoneNumber2;
        const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;

        const qrData = JSON.stringify({
            registrationId: registration.id,
            rider: riderNumber,
        });

        // Pre-fetch images
        const logoDataUrl = await toDataURL(Logo.src);
        const qrCodeDataUrl = await toDataURL(generateQrCodeUrl(qrData));

        const doc = new jsPDF({ orientation: 'p', unit: 'px', format: [350, 550] });

        const primaryColor = '#FF9933';
        const textColor = '#1A202C';
        const mutedColor = '#64748B';

        // --- Card Background ---
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.5);
        doc.roundedRect(5, 5, 340, 540, 8, 8, 'FD');

        // --- Header ---
        doc.setFillColor(255, 247, 237); // primary/10
        doc.rect(6, 6, 338, 50, 'F');
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
        // Approved/Rejected Badge
        doc.setFillColor(registration.status === 'approved' ? primaryColor : '#E53E3E');
        doc.roundedRect(260, 15, 75, 14, 7, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(registration.status.toUpperCase(), 300, 24, { align: 'center' });

        // Checked-in Badge
        doc.setFillColor(isCheckedIn ? '#C6F6D5' : '#E2E8F0'); // green-100 or gray-200
        doc.roundedRect(260, 33, 75, 14, 7, 7, 'F');
        doc.setTextColor(isCheckedIn ? '#22543D' : '#4A5568'); // green-800 or gray-600
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
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Rider Details', 20, 130);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text(`${riderName}, ${riderAge} years`, 20, 148);
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text(riderPhone || '', 20, 162);

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


  if (registration.registrationType === 'duo') {
    return (
        <div className="space-y-4">
            <Carousel setApi={setCarouselApi} className="w-full max-w-md mx-auto">
                <CarouselContent>
                    <CarouselItem>
                        <SingleTicket ref={ticketRefs.current[0]} registration={registration} riderNumber={1} />
                    </CarouselItem>
                    <CarouselItem>
                         <SingleTicket ref={ticketRefs.current[1]} registration={registration} riderNumber={2} />
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
        <SingleTicket ref={ticketRefs.current[0]} registration={registration} riderNumber={1} />
        <div className="flex justify-center">
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Ticket
            </Button>
        </div>
    </div>
  );
}

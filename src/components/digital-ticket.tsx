
"use client";

import type { User } from 'firebase/auth';
import React, { useRef, useState, useEffect } from 'react';
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
import { Bike, Calendar, Clock, MapPin, Ticket as TicketIcon, Users, Download, Phone, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

interface SingleTicketProps {
  registration: Registration;
  user: User;
  riderNumber: 1 | 2;
}

// A simple function to generate a QR code placeholder URL
const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
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
        <Card className="max-w-2xl mx-auto bg-card shadow-2xl overflow-hidden border-2 border-primary/20">
            <div className="bg-primary/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full border border-primary/20" />
                    <div>
                        <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                        <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <Badge variant={registration.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{registration.status}</Badge>
                   {isCheckedIn ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1"/> Checked-in
                        </Badge>
                   ) : (
                        <Badge variant="secondary">Not Checked-in</Badge>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-2"><UserIcon className="h-4 w-4" /> Rider Details</h4>
                            <p className="font-bold text-lg">{riderName}, {riderAge} years</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {riderPhone}</p>
                        </div>

                        <div className="flex gap-8 pt-2">
                            <div>
                                <h4 className="font-semibold text-muted-foreground text-sm">Reg. Type</h4>
                                <p className="font-bold text-lg flex items-center gap-2">
                                    {registration.registrationType === 'solo' ? <Bike className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                    <span className="mt-1">{registration.registrationType.charAt(0).toUpperCase() + registration.registrationType.slice(1)}</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-muted-foreground text-sm">Reg. ID</h4>
                                <p className="font-mono text-sm mt-1.5">{registration.id.substring(0, 10).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={150} height={150} />
                    </div>
                </div>

                <Separator />

                <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><div><p className="font-bold">Date</p><p className="text-muted-foreground">August 15, 2025</p></div></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><div><p className="font-bold">Assembly Time</p><p className="text-muted-foreground">6:00 AM</p></div></div>
                    <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-primary" /><div><p className="font-bold">Starting Point</p><p className="text-muted-foreground">Telefun Mobiles: Mahadevpet, Madikeri</p></div></div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
});
SingleTicket.displayName = 'SingleTicket';


export function DigitalTicket({ registration, user }: DigitalTicketProps) {
  const { toast } = useToast();
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    // Initialize refs array based on number of tickets
    const ticketCount = registration.registrationType === 'duo' ? 2 : 1;
    ticketRefs.current = ticketRefs.current.slice(0, ticketCount);
  }, [registration.registrationType]);

  const handleDownload = async () => {
    const currentSlide = registration.registrationType === 'duo' 
      ? (carouselApi?.selectedScrollSnap() ?? 0) 
      : 0;
    
    const element = ticketRefs.current[currentSlide];

    if (!element) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find ticket to download.' });
      return;
    }

    try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const riderName = currentSlide === 0 
          ? registration.fullName 
          : (registration.fullName2 || 'Rider2');
          
        pdf.save(`RideRegister-Ticket-${riderName.replace(/ /g, '_')}.pdf`);
    } catch(err) {
        console.error("Error generating PDF:", err);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'There was an issue creating the PDF.' });
    }
  };

  if (registration.registrationType === 'duo') {
    return (
        <div className="space-y-4">
            <Carousel setApi={setCarouselApi} className="w-full max-w-2xl mx-auto">
                <CarouselContent>
                    <CarouselItem>
                        <SingleTicket ref={el => ticketRefs.current[0] = el} registration={registration} user={user} riderNumber={1} />
                    </CarouselItem>
                    <CarouselItem>
                         <SingleTicket ref={el => ticketRefs.current[1] = el} registration={registration} user={user} riderNumber={2} />
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-[-10px] sm:left-[-50px]" />
                <CarouselNext className="right-[-10px] sm:right-[-50px]" />
            </Carousel>
             <div className="flex justify-center">
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Current Ticket
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
        <SingleTicket ref={el => ticketRefs.current[0] = el} registration={registration} user={user} riderNumber={1} />
        <div className="flex justify-center">
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
            </Button>
        </div>
    </div>
  );
}

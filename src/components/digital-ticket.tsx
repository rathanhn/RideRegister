
import type { User } from 'firebase/auth';
import React, { useState, useRef } from 'react';
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
import { Bike, CheckCircle, Users, Phone, User as UserIcon, Calendar, Clock, MapPin, Share2, ShieldCheck, AlertTriangle, Download, Loader2 } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const SingleTicket = React.forwardRef<HTMLDivElement, SingleTicketProps>(({ registration, riderNumber }, ref) => {
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
    <div ref={ref} id={`ticket-rider-${riderNumber}`}>
      <Card className="w-full bg-card shadow-2xl overflow-hidden border-2 border-primary/20">
        <CardHeader className="p-4 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="relative h-12 w-12 rounded-full border border-primary/20 flex items-center justify-center bg-white p-1 overflow-hidden">
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
            <CardDescription>Present this QR code at the check-in counter.</CardDescription>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                 <Avatar className="h-16 w-16 border-2 border-primary/50">
                    <AvatarImage src={photoUrl || undefined} alt={riderName || 'Rider'} />
                    <AvatarFallback><UserIcon className="w-8 h-8" /></AvatarFallback>
                </Avatar>
                <div className="space-y-1 mt-1">
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
                  <p className="font-mono text-xs md:text-sm pt-1">{registration.id.substring(0, 10).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
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
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link Copied!', description: 'The link to your dashboard has been copied to your clipboard.' });
      } catch (error) {
         toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the link to your clipboard.' });
      }
    }
  };
  
  const handleDownload = async () => {
    const currentSlide = carouselApi?.selectedScrollSnap() ?? 0;
    const ticketElement = document.getElementById(`ticket-rider-${currentSlide + 1}`);

    if (!ticketElement) {
        toast({ variant: "destructive", title: "Error", description: "Could not find ticket to download." });
        return;
    }

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(ticketElement, {
            scale: 2, 
            useCORS: true,
            logging: true,
            width: ticketElement.scrollWidth,
            height: ticketElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`RideRegister-Ticket-${registration.id.substring(0, 6)}.pdf`);

    } catch (error) {
        console.error("Error generating PDF", error);
        toast({ variant: "destructive", title: "Download Failed", description: "Could not generate PDF from ticket." });
    } finally {
        setIsDownloading(false);
    }
  };


  const ticketContainer = (
    registration.registrationType === 'duo' ? (
        <Carousel setApi={setCarouselApi} className="w-full max-w-xl mx-auto">
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
       <div className="max-w-xl mx-auto">
          <SingleTicket registration={registration} riderNumber={1} user={user} />
      </div>
    )
  );

  return (
    <div className="space-y-4">
      {ticketContainer}
      <div className="flex flex-col items-center gap-4 max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row w-full gap-4">
            <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
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
                    <strong>Important:</strong> Present the QR code on your ticket for check-in.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

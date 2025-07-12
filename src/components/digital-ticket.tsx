
import type { User } from 'firebase/auth';
import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
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
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
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
    <div ref={ref} id={`ticket-rider-${riderNumber}`} className="bg-card p-0.5 rounded-lg shadow-2xl border-2 border-primary/20">
      <div className="bg-background rounded-md">
        {/* Header */}
        <div className="p-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
                 <div>
                    <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                    <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                 </div>
              </div>
              <Badge variant={isCheckedIn ? 'default' : 'secondary'} className={isCheckedIn ? 'bg-green-600' : ''}>
                 {isCheckedIn ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                 {isCheckedIn ? 'Checked-in' : 'Pending Check-in'}
              </Badge>
           </div>
        </div>
        <div className="w-full h-2 bg-gradient-to-r from-primary via-white to-green-600" />
        
        {/* Main Content */}
        <div className="p-4 flex gap-4">
            {/* Left Side - Rider Info */}
            <div className="flex-grow space-y-4">
                <Avatar className="h-24 w-24 border-4 border-primary/50">
                    <AvatarImage src={photoUrl || undefined} alt={riderName || 'Rider'} />
                    <AvatarFallback><UserIcon className="w-12 h-12" /></AvatarFallback>
                </Avatar>
                 <div>
                    <p className="text-sm text-muted-foreground">Rider Name {isDuo ? `(${riderNumber}/2)` : ''}</p>
                    <h4 className="font-bold text-2xl">{riderName}</h4>
                 </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <h4 className="font-semibold">{riderAge} years</h4>
                 </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Registration Type</p>
                    <h4 className="font-semibold capitalize flex items-center gap-2">
                        {registration.registrationType === 'solo' ? <Bike className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                        {registration.registrationType}
                    </h4>
                 </div>
            </div>

            {/* Right Side - QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-between text-center w-[160px]">
                <div className="w-[150px] h-[150px] p-2 bg-white rounded-md flex items-center justify-center border">
                    <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={140} height={140} />
                </div>
                 <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Registration ID</p>
                    <p className="font-mono text-sm font-bold">{registration.id.substring(0, 10).toUpperCase()}</p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 p-4 border-t rounded-b-md">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Location</p><p className="text-muted-foreground">Telefun Mobiles, Madikeri</p></div></div>
                <div className="flex items-start gap-2"><Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><div><p className="font-bold">Date & Time</p><p className="text-muted-foreground">Aug 15, 2025 - 6:00 AM</p></div></div>
            </div>
        </div>
      </div>
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
            logging: false, // set to true for debugging
            width: ticketElement.scrollWidth,
            height: ticketElement.scrollHeight,
            windowWidth: ticketElement.scrollWidth,
            windowHeight: ticketElement.scrollHeight,
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

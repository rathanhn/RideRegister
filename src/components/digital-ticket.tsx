
import type { User } from 'firebase/auth';
import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { Bike, CheckCircle, Users, User as UserIcon, Share2, AlertTriangle, Download, Loader2 } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

const SingleTicket = React.forwardRef<HTMLDivElement, SingleTicketProps>(({ registration, riderNumber }, ref) => {
  const isDuo = registration.registrationType === 'duo';
  const riderName = riderNumber === 1 ? registration.fullName : registration.fullName2;
  const isCheckedIn = riderNumber === 1 ? registration.rider1CheckedIn : registration.rider2CheckedIn;
  const photoUrl = riderNumber === 1 ? registration.photoURL : registration.photoURL2;

  const qrData = JSON.stringify({
    registrationId: registration.id,
    rider: riderNumber,
  });

  return (
    <div ref={ref} id={`ticket-${riderNumber}`} className="bg-[#09090b] text-white rounded-lg shadow-2xl border border-primary/20 overflow-hidden font-body">
        <div className="p-4 bg-muted/10 relative">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Image src="/Logo.png" alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
                 <div>
                    <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                    <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                 </div>
              </div>
           </div>
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-grow space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/50">
                        <AvatarImage src={photoUrl || undefined} alt={riderName || 'Rider'} />
                        <AvatarFallback><UserIcon className="w-10 h-10" /></AvatarFallback>
                    </Avatar>
                     <div>
                        <p className="text-sm text-muted-foreground">Rider Name {isDuo ? `(${riderNumber}/2)` : ''}</p>
                        <h4 className="font-bold text-2xl">{riderName}</h4>
                     </div>
                </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                     <div>
                        <p className="font-semibold text-muted-foreground">Reg. Type</p>
                        <h4 className="font-semibold capitalize flex items-center gap-2">
                            {registration.registrationType === 'solo' ? <Bike className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                            {registration.registrationType}
                        </h4>
                     </div>
                     <div>
                        <p className="font-semibold text-muted-foreground">Check-in Status</p>
                         <Badge variant={isCheckedIn ? 'default' : 'secondary'} className={`mt-1 ${isCheckedIn ? 'bg-green-600' : ''}`}>
                             {isCheckedIn ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                             {isCheckedIn ? 'Checked-in' : 'Pending'}
                          </Badge>
                     </div>
                 </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center justify-center text-center bg-muted/10 p-3 rounded-lg w-full sm:w-[150px]">
                <div className="w-[120px] h-[120px] p-2 bg-white rounded-md flex items-center justify-center border">
                    <Image src={generateQrCodeUrl(qrData)} alt="QR Code" width={110} height={110} crossOrigin="anonymous" />
                </div>
                 <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Reg. ID</p>
                    <p className="font-mono text-sm font-bold tracking-tighter">{registration.id.substring(0, 10).toUpperCase()}</p>
                </div>
            </div>
        </div>

        <div className="bg-muted/10 p-2 border-t border-white/10 text-center">
             <p className="text-xs text-muted-foreground">Present this ticket for check-in on August 15, 2025 at Telefun Mobiles, Madikeri.</p>
        </div>
      </div>
  );
});
SingleTicket.displayName = 'SingleTicket';


export function DigitalTicket({ registration, user }: DigitalTicketProps) {
  const { toast } = useToast();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  const ticketRef1 = useRef<HTMLDivElement>(null);
  const ticketRef2 = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const currentSlide = carouselApi?.selectedScrollSnap() ?? 0;
    const isDuo = registration.registrationType === 'duo';
    const elementToCapture = (isDuo && currentSlide === 1) ? ticketRef2.current : ticketRef1.current;
    
    if (!elementToCapture) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the ticket element to download.' });
        return;
    }
    
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(elementToCapture, {
            allowTaint: true,
            useCORS: true, // Allow fetching images from other domains (like the QR code)
            backgroundColor: '#09090b', // Force a dark background for consistency
            scale: 2, // Increase resolution
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`RideRegister-Ticket-${registration.id.substring(0,6)}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };


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

  const ticketContainer = (
    registration.registrationType === 'duo' ? (
        <Carousel setApi={setCarouselApi} className="w-full max-w-xl mx-auto">
          <CarouselContent>
            <CarouselItem>
              <SingleTicket ref={ticketRef1} registration={registration} riderNumber={1} user={user} />
            </CarouselItem>
            <CarouselItem>
              <SingleTicket ref={ticketRef2} registration={registration} riderNumber={2} user={user} />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-[-10px] sm:left-[-20px] h-8 w-8" />
          <CarouselNext className="right-[-10px] sm:right-[-20px] h-8 w-8" />
        </Carousel>
    ) : (
       <div className="max-w-xl mx-auto">
          <SingleTicket ref={ticketRef1} registration={registration} riderNumber={1} user={user} />
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

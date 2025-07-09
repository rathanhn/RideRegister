"use client";

import type { User } from 'firebase/auth';
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
import { Bike, Calendar, Clock, MapPin, Ticket as TicketIcon, Users, Download, Phone, User as UserIcon } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from './ui/button';

interface DigitalTicketProps {
    registration: Registration;
    user: User;
}

export function DigitalTicket({ registration, user }: DigitalTicketProps) {

  // A simple function to generate a QR code placeholder URL
  const generateQrCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
  }
  
  const handleDownload = () => {
    // In a real app, you might use a library like html2canvas and jspdf to generate a downloadable PDF
    alert("Download functionality would be implemented here.");
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card shadow-2xl overflow-hidden">
        <div className="bg-primary/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image src={Logo} alt="TeleFun Mobile Logo" width={40} height={40} className="rounded-full" />
                <div>
                    <h3 className="font-bold text-primary">TeleFun Mobile</h3>
                    <p className="text-sm text-muted-foreground">Independence Day Ride 2025</p>
                </div>
            </div>
            <TicketIcon className="h-8 w-8 text-primary" />
        </div>
      <CardContent className="p-0">
        <div className="p-6">
            <CardTitle className="text-2xl font-headline">Your Ride Ticket</CardTitle>
            <CardDescription>Present this ticket at the check-in counter.</CardDescription>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-1"><UserIcon className="h-4 w-4" /> Rider 1 Details</h4>
                    <p className="font-bold text-lg">{registration.fullName}, {registration.age} years</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {registration.phoneNumber}</p>
                </div>
                {registration.registrationType === 'duo' && registration.fullName2 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-1"><UserIcon className="h-4 w-4" /> Rider 2 Details</h4>
                        <p className="font-bold text-lg">{registration.fullName2}, {registration.age2} years</p>
                         <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {registration.phoneNumber2}</p>
                    </div>
                )}
                <div className="flex gap-8 pt-2">
                    <div>
                        <h4 className="font-semibold text-muted-foreground text-sm">Registration Type</h4>
                        <p className="font-bold text-lg flex items-center gap-2">
                            {registration.registrationType === 'solo' ? <Bike className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                            {registration.registrationType.charAt(0).toUpperCase() + registration.registrationType.slice(1)}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-muted-foreground text-sm">Registration ID</h4>
                        <p className="font-mono text-sm">{registration.id.substring(0, 10).toUpperCase()}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center">
                 <Image src={generateQrCodeUrl(`RiderID: ${registration.id}`)} alt="QR Code" width={150} height={150} />
            </div>
        </div>

        <Separator />
        
        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                    <p className="font-bold">Date</p>
                    <p className="text-muted-foreground">August 15, 2025</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <p className="font-bold">Assembly Time</p>
                    <p className="text-muted-foreground">6:00 AM</p>
                </div>
            </div>
             <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                    <p className="font-bold">Starting Point</p>
                    <p className="text-muted-foreground">Telefun Mobiles: Mahadevpet, Madikeri</p>
                </div>
            </div>
        </div>
      </CardContent>
       <CardFooter className="bg-primary/10 p-4 flex justify-end">
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
            </Button>
      </CardFooter>
    </Card>
  );
}

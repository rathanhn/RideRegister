
"use client";

import React from 'react';
import Image from 'next/image';
import Logo from '@/Logo.png';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'lucide-react';

interface RideCertificateProps {
  riderName: string;
  riderPhotoUrl?: string;
}

export const RideCertificate = React.forwardRef<HTMLDivElement, RideCertificateProps>(
  ({ riderName, riderPhotoUrl }, ref) => {
    const eventDate = format(new Date("2025-08-16"), "do 'of' MMMM yyyy");

    return (
      <div
        id="certificate"
        ref={ref}
        className="w-[1123px] h-[794px] bg-black p-2"
        style={{ fontFamily: "'Garamond', 'serif'" }}
      >
        <div className="w-full h-full p-6 bg-black flex flex-col items-center justify-between text-center relative border-4 border-transparent bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-border">
          
          <div className="w-full flex justify-between items-start">
             <div className="w-20 h-20 border-t-4 border-l-4 border-orange-500"></div>
             <div className="flex-grow flex justify-center pt-4">
                <Image 
                    src={Logo} 
                    alt="TeleFun Logo" 
                    width={80} 
                    height={80} 
                    className="rounded-full"
                    priority
                />
             </div>
             <div className="w-20 h-20 border-t-4 border-r-4 border-green-500"></div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center -mt-16">
            <h1 className="text-5xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Certificate of Completion
            </h1>

            <p className="mt-6 text-lg text-gray-300">This certificate is proudly presented to</p>
            
            <Avatar className="h-40 w-40 border-4 border-primary/50 my-6">
                <AvatarImage src={riderPhotoUrl} alt={riderName} />
                <AvatarFallback><User className="w-20 h-20" /></AvatarFallback>
            </Avatar>

            <div className="w-full max-w-lg text-center">
                <p className="text-6xl font-extrabold text-white pb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {riderName || "Honorable Rider"}
                </p>
                <div className="h-[2px] bg-primary w-full"></div>
            </div>

            <p className="text-lg max-w-2xl text-gray-300 mt-6">
                for successfully completing the <strong>TeleFun Mobile Independence Day Freedom Ride 2025</strong>. 
                Your participation and spirit have made this event a grand success.
            </p>
          </div>
          
          <div className="w-full flex justify-between items-end">
            <div className="w-20 h-20 border-b-4 border-l-4 border-orange-500"></div>
             <div className="flex-grow flex justify-around w-full max-w-3xl pb-4">
                <div className="text-center">
                <p className="text-xl font-semibold border-b-2 border-primary pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Event Organizer</p>
                <p className="text-sm mt-1 text-gray-400">TeleFun Mobile</p>
                </div>
                <div className="text-center">
                <p className="text-xl font-semibold border-b-2 border-primary pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Date of Event</p>
                <p className="text-sm mt-1 text-gray-400">{eventDate}</p>
                </div>
            </div>
            <div className="w-20 h-20 border-b-4 border-r-4 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }
);

RideCertificate.displayName = 'RideCertificate';


"use client";

import React from 'react';
import Image from 'next/image';
import Logo from '@/Logo.png';
import { format } from 'date-fns';

interface RideCertificateProps {
  riderName: string;
}

export const RideCertificate = React.forwardRef<HTMLDivElement, RideCertificateProps>(
  ({ riderName }, ref) => {
    const eventDate = format(new Date("2025-08-16"), "do 'of' MMMM yyyy");

    return (
      <div
        id="certificate"
        ref={ref}
        className="w-[1123px] h-[794px] bg-black p-2 bg-gradient-to-r from-orange-500 via-white to-green-500"
        style={{ fontFamily: "'Garamond', 'serif'" }}
      >
        <div className="w-full h-full p-6 bg-black flex flex-col items-center justify-center text-center relative">
          
          <div className="block mx-auto mb-4">
            <Image 
                src={Logo} 
                alt="TeleFun Logo" 
                width={80} 
                height={80} 
                className="rounded-full"
                priority
            />
          </div>

          <h1 className="text-5xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Certificate of Completion
          </h1>

          <p className="mt-6 text-lg text-gray-300">This certificate is proudly presented to</p>
          
          <div className="my-8 w-full max-w-lg text-center">
            <p className="text-6xl font-extrabold text-white pb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
              {riderName || "Honorable Rider"}
            </p>
            <div className="h-[2px] bg-primary w-full"></div>
          </div>


          <p className="text-lg max-w-2xl text-gray-300">
            for successfully completing the <strong>TeleFun Mobile Independence Day Freedom Ride 2025</strong>. 
            Your participation and spirit have made this event a grand success.
          </p>
          
          <div className="w-full h-px bg-gray-700 my-8"></div>

          <div className="flex justify-between w-full max-w-2xl">
            <div className="text-center">
              <p className="text-xl font-semibold border-b-2 border-primary pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Event Organizer</p>
              <p className="text-sm mt-1 text-gray-400">TeleFun Mobile</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold border-b-2 border-primary pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Date of Event</p>
              <p className="text-sm mt-1 text-gray-400">{eventDate}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RideCertificate.displayName = 'RideCertificate';

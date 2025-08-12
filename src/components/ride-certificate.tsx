
"use client";

import React from 'react';
import Image from 'next/image';
import Logo from '@/Logo.png';
import { format } from 'date-fns';

interface RideCertificateProps {
  riderName: string;
}

// Using a forwardRef to allow the parent component to get a DOM reference to this component's root element.
// This is necessary for html2canvas to capture it.
export const RideCertificate = React.forwardRef<HTMLDivElement, RideCertificateProps>(
  ({ riderName }, ref) => {
    const eventDate = format(new Date("2025-08-16"), "do 'of' MMMM yyyy");

    return (
      <div
        id="certificate" // ID for capturing
        ref={ref}
        className="w-[1123px] h-[794px] p-8 bg-gray-900 text-white font-serif flex flex-col items-center justify-center border-4 border-gray-700"
        style={{ fontFamily: "'Garamond', 'serif'"}}
      >
        {/* Ornate Border */}
        <div className="w-full h-full border-2 border-gray-600 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gray-500"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-gray-500"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-gray-500"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gray-500"></div>

          <div className="block mx-auto mb-4">
            <Image 
                src={Logo} 
                alt="TeleFun Logo" 
                width={80} 
                height={80} 
                className="rounded-full"
                priority // Ensures preload
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
          
           <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-500" />
        </div>
      </div>
    );
  }
);

RideCertificate.displayName = 'RideCertificate';

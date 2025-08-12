
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
        ref={ref} 
        className="w-[1123px] h-[794px] p-8 bg-white text-black font-serif flex flex-col items-center justify-center border-4 border-amber-500"
        style={{ fontFamily: "'Garamond', 'serif'"}}
      >
        {/* Ornate Border */}
        <div className="w-full h-full border-2 border-amber-600 p-6 flex flex-col items-center justify-center text-center relative">
          
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-amber-400"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-400"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-400"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-amber-400"></div>

          <div className="flex items-center gap-4 mb-4">
            <Image src={Logo} alt="TeleFun Logo" width={80} height={80} className="rounded-full" />
          </div>

          <h1 className="text-5xl font-bold text-amber-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Certificate of Completion
          </h1>

          <p className="mt-6 text-lg">This certificate is proudly presented to</p>

          <p className="text-6xl font-extrabold text-amber-600 my-8 px-4 border-b-2 border-amber-700" style={{ fontFamily: "'Dancing Script', cursive" }}>
            {riderName || "Honorable Rider"}
          </p>

          <p className="text-lg max-w-2xl">
            for successfully completing the <strong>TeleFun Mobile Independence Day Freedom Ride 2025</strong>. 
            Your participation and spirit have made this event a grand success.
          </p>
          
          <div className="w-full h-px bg-amber-300 my-8"></div>

          <div className="flex justify-between w-full max-w-2xl">
            <div className="text-center">
              <p className="text-xl font-semibold border-b-2 border-amber-600 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Event Organizer</p>
              <p className="text-sm mt-1">TeleFun Mobile</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold border-b-2 border-amber-600 pb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Date of Event</p>
              <p className="text-sm mt-1">{eventDate}</p>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

RideCertificate.displayName = 'RideCertificate';

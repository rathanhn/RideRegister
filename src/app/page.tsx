
"use client";

import { Header } from "@/components/header";
import { Announcements } from "@/components/announcements";
import { Offers } from "@/components/offers";
import { CountdownTimer } from "@/components/countdown-timer";
import { StoreDetails } from "@/components/store-details";
import { RouteMap } from "@/components/route-map";
import { MapPin } from "lucide-react";
import { Organizers } from "@/components/organizers";
import { EventSchedule } from "@/components/event-schedule";
import { Hero } from "@/components/hero";
import { Faq } from "@/components/faq";
import { QnaSection } from "@/components/qna-section";
import { RegisteredRiders } from "@/components/registered-riders";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMemo } from "react";
import type { ScheduleEvent } from "@/lib/types";


export default function Home() {
  const [schedule, loading, error] = useCollection(
    query(collection(db, 'schedule'), orderBy('createdAt', 'asc'), limit(1))
  );

  const targetDate = useMemo(() => {
    if (loading || error || !schedule || schedule.docs.length === 0) {
      // Return a default or past date if not loaded, to avoid showing a wrong countdown
      return new Date("2025-08-15T06:00:00");
    }
    const firstEvent = schedule.docs[0].data() as ScheduleEvent;
    // Attempt to parse the time string from the schedule.
    // Example: "6:00 AM" becomes part of "YYYY-MM-DDTHH:MM:SS"
    // We assume the date is August 15, 2025 for this example.
    const [time, period] = firstEvent.time.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period?.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    }
    if (period?.toLowerCase() === 'am' && hours === 12) {
      hours = 0; // Midnight case
    }
    
    const eventDate = new Date("2025-08-15T00:00:00");
    eventDate.setHours(hours, minutes, 0);

    return eventDate;
  }, [schedule, loading, error]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
       <div className="bg-secondary text-secondary-foreground py-2 border-b">
        <div className="container mx-auto flex justify-center items-center gap-2 text-center px-4">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            Telefun Mobiles: Mahadevpet, Madikeri
          </p>
        </div>
      </div>
      <CountdownTimer targetDate={targetDate} />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <Hero />
        <RegisteredRiders />
        
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EventSchedule />
            <RouteMap />
        </div>
        
        <Offers />

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Announcements />
             <QnaSection />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Faq />
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-8">
                 <StoreDetails />
            </div>
        </div>
        
        <Organizers />

      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} TeleFun Mobile. All Rights Reserved.</p>
         <p>Follow us on <Link href="https://www.instagram.com/telefun_" target="_blank" className="text-primary hover:underline">Instagram</Link></p>
      </footer>
    </div>
  );
}

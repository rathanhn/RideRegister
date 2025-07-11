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

export default function Home() {
  const rideDate = new Date("2025-08-15T06:00:00");

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
      <CountdownTimer targetDate={rideDate} />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <Hero />
        <RegisteredRiders />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <EventSchedule />
             <RouteMap />
             <Faq />
             <QnaSection />
          </div>
          <div className="flex flex-col gap-8">
            <Announcements />
            <Offers />
            <StoreDetails />
          </div>
        </div>
        
        <Organizers />

      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} TeleFun Mobile. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

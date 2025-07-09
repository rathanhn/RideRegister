import { Header } from "@/components/header";
import { RegistrationForm } from "@/components/registration-form";
import { Announcements } from "@/components/announcements";
import { Offers } from "@/components/offers";
import { CountdownTimer } from "@/components/countdown-timer";
import { StoreDetails } from "@/components/store-details";
import { RouteMap } from "@/components/route-map";

export default function Home() {
  const rideDate = new Date("2025-08-15T06:00:00");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <CountdownTimer targetDate={rideDate} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RegistrationForm />
          </div>
          <div className="flex flex-col gap-8">
            <Announcements />
            <Offers />
            <StoreDetails />
          </div>
        </div>
        <div className="mt-8">
          <RouteMap />
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} TeleFun Mobile. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

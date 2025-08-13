
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import HeroImage from "@/hero.png";
import { Gift, UtensilsCrossed, BadgePercent, Calendar, MapPin } from "lucide-react";
import { StuntPerformers } from "./stunt-performers";

export function Hero({ registrationsOpen }: { registrationsOpen: boolean }) {
    return (
        <div className="rounded-lg bg-card shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12 text-center">
                 <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                    Freedom Ride 2025
                </h2>
                <p className="mt-4 text-base sm:text-lg text-foreground/80 max-w-2xl mx-auto">
                    Join TeleFun Mobile for an exhilarating bike ride to celebrate the spirit of freedom. Register now and be part of the excitement!
                </p>

                 <div className="mt-8 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <UtensilsCrossed className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Free Lunch</h4>
                            <p className="text-sm text-muted-foreground">Enjoy a complimentary meal.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Gift className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Awesome Gifts</h4>
                            <p className="text-sm text-muted-foreground">Win exciting prizes & goodies.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <BadgePercent className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Store Discounts</h4>
                            <p className="text-sm text-muted-foreground">Get exclusive in-store offers.</p>
                        </div>
                    </div>
                </div>

                <div className="my-6 md:my-8 flex justify-center">
                    <Image
                        src={HeroImage}
                        alt="Motorcyclists on a freedom ride with Indian and event flags"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-md object-cover"
                        priority
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" disabled={!registrationsOpen}>
                        {registrationsOpen ? (
                             <Link href="/register">Register Now</Link>
                        ) : (
                            <span>Registrations Closed</span>
                        )}
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/login">Check Status / Login</Link>
                    </Button>
                </div>

                <div className="mt-12 p-6 bg-secondary/50 rounded-lg border-l-4 border-primary">
                    <h3 className="font-bold text-2xl text-left">🏍💨 Get Ready for the Thrill!</h3>
                    <p className="mt-2 text-left text-muted-foreground">
                        Experience thrilling stunts and exciting action at the Freedom Ride 2K25 this Independence Day weekend!
                        <span className="block font-semibold mt-2"><strong>BY TEAM POWER STROKZ</strong></span>
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary"/>
                            <strong>Date: 16th August 2025</strong>
                        </div>
                        <div className="flex items-center gap-3">
                             <MapPin className="h-5 w-5 text-primary"/>
                             <strong>Location: 5G Holidays Escape Resort, Kushalnagar</strong>
                        </div>
                    </div>
                     <p className="mt-4 font-semibold text-lg text-left text-primary">
                        🎯 Special Highlight: Bike Stunt Show Powered by TeleFun Mobiles 🏍💨
                    </p>
                    <p className="mt-4 font-bold text-xl text-center">Come for the ride, stay for the thrill! 🚀</p>
                </div>
                <div className="mt-8">
                    <StuntPerformers />
                </div>
            </div>
        </div>
    );
}

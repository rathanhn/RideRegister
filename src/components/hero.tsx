
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
    return (
        <div className="relative overflow-hidden rounded-lg bg-card shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center text-center md:text-left z-10">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                        Independence Day <br />
                        Freedom Ride 2025
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Join TeleFun Mobile for an exhilarating bike ride to celebrate the spirit of freedom. Register now and be part of the excitement!
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button asChild size="lg">
                            <Link href="/register">Register Now</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/login">Check Status / Login</Link>
                        </Button>
                    </div>
                </div>
                <div className="hidden md:block relative">
                    {/* The image is now in its own grid column, but absolutely positioned to fill it */}
                </div>
            </div>
            {/* The image is taken out of the grid flow and positioned to fill the background */}
            <div className="absolute inset-0 z-0">
                 <Image
                    src="/Hero.png"
                    alt="Motorcyclists on a freedom ride with Indian and event flags"
                    fill
                    className="object-cover"
                    data-ai-hint="motorcycle ride"
                    priority
                />
                 <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent md:from-background/60 md:via-background/10"></div>
            </div>
        </div>
    );
}


import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import HeroImage from "@/hero.png";

export function Hero() {
    return (
        <div className="rounded-lg bg-card shadow-lg overflow-hidden">
            <div className="p-8 md:p-12 text-center">
                 <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                    Independence Day <br />
                    Freedom Ride 2025
                </h2>
                <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                    Join TeleFun Mobile for an exhilarating bike ride to celebrate the spirit of freedom. Register now and be part of the excitement!
                </p>

                <div className="my-8 flex justify-center">
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
                    <Button asChild size="lg">
                        <Link href="/register">Register Now</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/login">Check Status / Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

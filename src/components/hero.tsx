
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/Logo.png";

export function Hero() {
    return (
        <div className="relative overflow-hidden rounded-lg bg-card shadow-lg min-h-[400px] md:min-h-[350px]">
            <div className="absolute inset-0 z-0">
                 <Image
                    src={Logo}
                    alt="Motorcyclists on a freedom ride with Indian and event flags"
                    fill
                    className="object-cover"
                    data-ai-hint="motorcycle ride"
                    priority
                    placeholder="blur"
                />
                 <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>
            </div>
            <div className="relative z-10 flex items-center h-full p-8 md:p-12 lg:p-16">
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                        Independence Day <br />
                        Freedom Ride 2025
                    </h2>
                    <p className="mt-4 text-lg text-foreground/80">
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
            </div>
        </div>
    );
}

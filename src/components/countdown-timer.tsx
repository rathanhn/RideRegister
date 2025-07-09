"use client";

import { useState, useEffect } from "react";

const calculateTimeLeft = (targetDate: Date) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        return (
            <div key={interval} className="flex flex-col items-center bg-card/80 p-3 rounded-lg min-w-[70px] md:min-w-[90px] shadow-lg border border-primary/20">
                <span className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase text-muted-foreground tracking-wider mt-1">{interval}</span>
            </div>
        );
    });

    const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

    return (
        <div className="bg-muted/50 border-b">
            <div className="container mx-auto py-4">
                <div className="flex justify-center items-center gap-3 md:gap-6">
                    {hasTimeLeft ? timerComponents : <div className="text-xl font-bold text-primary p-4">The Ride has begun!</div>}
                </div>
            </div>
        </div>
    );
}

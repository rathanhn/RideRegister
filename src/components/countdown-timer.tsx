
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const calculateTimeLeft = (targetDate: Date) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: difference
    };

    if (difference > 0) {
        timeLeft = {
            ...timeLeft,
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

// Event is "happening" from T-0 to T+4 hours.
const EVENT_DURATION_MS = 4 * 60 * 60 * 1000;

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        // Set initial time left
        setTimeLeft(calculateTimeLeft(targetDate));
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timerComponents = Object.entries(timeLeft)
      .filter(([key]) => ['days', 'hours', 'minutes', 'seconds'].includes(key))
      .map(([interval, value]) => {
        return (
            <div key={interval} className="flex flex-col items-center bg-card/80 p-3 rounded-lg min-w-[70px] md:min-w-[90px] shadow-lg border border-primary/20">
                <span className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase text-muted-foreground tracking-wider mt-1">{interval}</span>
            </div>
        );
    });

    if (!isClient) {
        return <div className="bg-muted/50 border-b"><div className="container mx-auto py-4 h-[105px] md:h-[137px]"></div></div>;
    }
    
    // Check if event has been over for more than the set duration
    if (timeLeft.total < -EVENT_DURATION_MS) {
        return null; // Don't render the timer if the event is long past
    }

    // Check if the event is currently happening
    if (timeLeft.total <= 0 && timeLeft.total >= -EVENT_DURATION_MS) {
        return (
            <div className="bg-muted/50 border-b">
                <div className="container mx-auto py-4 flex justify-center items-center h-[105px] md:h-[137px]">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-xl md:text-2xl font-bold text-primary p-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-4 h-4 rounded-full bg-destructive"
                        />
                        Happening Now!
                    </motion.div>
                </div>
            </div>
        );
    }
    
    // Default: Show the countdown
    return (
        <div className="bg-muted/50 border-b">
            <div className="container mx-auto py-4">
                <div className="flex justify-center items-center gap-3 md:gap-6">
                    {timerComponents}
                </div>
            </div>
        </div>
    );
}

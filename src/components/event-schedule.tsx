import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ScheduleEvent } from "@/lib/types";
import { Flag, Coffee, Medal, Users, Cake, Map, CheckCircle } from "lucide-react";

const schedule: ScheduleEvent[] = [
    {
        id: 1,
        time: "6:00 AM",
        title: "Assembly & Check-in",
        description: "Gather at Telefun Mobiles. Verify your registration and get your rider number.",
        icon: Users,
    },
    {
        id: 2,
        time: "6:30 AM",
        title: "Flag Off",
        description: "The ride officially begins! Follow the lead rider and enjoy the journey.",
        icon: Flag,
    },
    {
        id: 3,
        time: "7:30 AM",
        title: "Mid-point Break",
        description: "A short break for refreshments and water. Let's stay hydrated!",
        icon: Coffee,
    },
     {
        id: 4,
        time: "8:30 AM",
        title: "Ride Conclusion",
        description: "Return to the starting point at Telefun Mobiles.",
        icon: CheckCircle,
    },
    {
        id: 5,
        time: "8:45 AM",
        title: "Certificate & Refreshments",
        description: "Collect your participation certificate and enjoy some post-ride snacks.",
        icon: Medal,
    },
    {
        id: 6,
        time: "9:00 AM",
        title: "Independence Day Celebration",
        description: "Join us for a small celebration to mark the occasion.",
        icon: Cake,
    },
];

export function EventSchedule() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Map className="h-6 w-6 text-primary" />
                    Event Schedule
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative pl-6">
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                    {schedule.map((item, index) => (
                        <div key={item.id} className="relative mb-8 pl-8">
                            <div className="absolute -left-0.5 top-1 h-5 w-5 rounded-full bg-primary ring-4 ring-background flex items-center justify-center">
                                <item.icon className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <p className="font-semibold text-primary">{item.time}</p>
                                <h4 className="font-bold">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

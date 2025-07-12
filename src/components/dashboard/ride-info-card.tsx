
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Clock, MapPin, ListChecks } from "lucide-react";

const rideRules = [
    "A helmet is compulsory for all riders.",
    "Obey all traffic laws and signals.",
    "Maintain a safe distance from other riders.",
    "No racing or dangerous stunts are allowed.",
    "Follow instructions from event organizers at all times.",
    "Ensure your bicycle is in good working condition."
];

export function RideInfoCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Information</CardTitle>
                <CardDescription>Key details about the Independence Day Ride.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Date</p>
                            <p className="text-muted-foreground">August 15, 2025</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Time</p>
                            <p className="text-muted-foreground">6:00 AM Assembly</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg col-span-1 sm:col-span-2">
                        <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-muted-foreground">Telefun Mobiles, Mahadevpet, Madikeri</p>
                        </div>
                    </div>
                </div>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="rules">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                <span className="font-semibold">Ride Rules</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-2">
                                {rideRules.map(rule => <li key={rule}>{rule}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

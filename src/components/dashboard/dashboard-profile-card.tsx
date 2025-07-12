
"use client";

import type { AppUser, Registration } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Calendar, Ticket } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface DashboardProfileCardProps {
    user: AppUser | null;
    registration: Registration | null;
}

export function DashboardProfileCard({ user, registration }: DashboardProfileCardProps) {
    if (!user) return null;

    const photoSrc = registration?.photoURL || user.photoURL || undefined;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={photoSrc} alt={user.displayName ?? 'User'} />
                    <AvatarFallback><User className="w-8 h-8"/></AvatarFallback>
                </Avatar>
                <div className="pt-2">
                    <CardTitle>{user.displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {registration ? (
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{registration.phoneNumber}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{registration.age} years old</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{registration.registrationType} Registration</span>
                        </div>
                        {registration.registrationType === 'duo' && (
                            <div className="col-span-2 p-3 bg-secondary rounded-md flex items-start gap-4">
                                 <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={registration.photoURL2 ?? undefined} alt={registration.fullName2} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div className="flex-grow text-left">
                                    <p className="font-semibold">{registration.fullName2}</p>
                                    <p className="text-xs text-muted-foreground">{registration.phoneNumber2}</p>
                                    <p className="text-xs text-muted-foreground">{registration.age2} years old</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                   <div className="space-y-2 text-center text-muted-foreground border-t pt-4">
                        <p>You haven&apos;t registered for the ride yet.</p>
                   </div>
                )}
            </CardContent>
        </Card>
    );
}

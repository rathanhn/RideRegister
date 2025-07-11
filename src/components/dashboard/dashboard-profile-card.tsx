
"use client";

import type { AppUser, Registration } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Calendar, Users, Ticket } from "lucide-react";

interface DashboardProfileCardProps {
    user: AppUser | null;
    registration: Registration | null;
}

export function DashboardProfileCard({ user, registration }: DashboardProfileCardProps) {
    if (!user) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={user.photoURL ?? registration?.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{user.displayName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            {registration && (
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
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
                        <div className="flex items-center gap-2 col-span-2 p-3 bg-secondary rounded-md">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{registration.fullName2}</p>
                                <p className="text-muted-foreground">{registration.phoneNumber2}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

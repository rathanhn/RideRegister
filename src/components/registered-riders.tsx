
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, MoveRight } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';

export function RegisteredRiders() {
  // Fetch all registrations and order them
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );

  // Filter for approved riders on the client side
  const approvedRiders = useMemo(() => {
    if (!registrations) return [];
    return registrations.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Registration))
      .filter(rider => rider.status === 'approved');
  }, [registrations]);


  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-secondary/50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Loading Registered Riders...</p>
      </div>
    );
  }

  // If there's an error or no approved riders, render nothing.
  if (error || approvedRiders.length === 0) {
    return null;
  }

  return (
    <Card>
       <CardHeader className="text-center">
            <h2 className="text-2xl font-bold font-headline">Registered Riders</h2>
       </CardHeader>
       <CardContent>
          <Carousel
            opts={{
              align: "start",
              loop: approvedRiders.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {approvedRiders.map((rider) => (
                <CarouselItem key={rider.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6 gap-2 aspect-square">
                        <Avatar className="w-32 h-32 border-4 border-primary/50">
                          <AvatarImage src={rider.photoURL} alt={rider.fullName} />
                          <AvatarFallback>
                            <User className="w-16 h-16" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-semibold text-center truncate w-full px-1">{rider.fullName}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1 md:hidden">
              Scroll to see more <MoveRight className="h-3 w-3" />
          </p>

          <div className="text-center mt-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">View All Riders ({approvedRiders.length})</Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>All Registered Riders</SheetTitle>
                        <SheetDescription>
                            Here are all the amazing riders who have joined the event.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
                        <div className="space-y-4">
                            {approvedRiders.map((rider) => (
                                <div key={rider.id} className="flex items-center gap-4 p-2 border rounded-md">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={rider.photoURL} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{rider.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{rider.registrationType === 'duo' ? 'Duo Rider' : 'Solo Rider'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
          </div>
       </CardContent>
    </Card>
  );
}

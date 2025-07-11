
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MoveRight } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

const RiderSkeleton = () => (
    <div className="p-1">
        <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-2 aspect-square">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
            </CardContent>
        </Card>
    </div>
);


export function RegisteredRiders() {
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'))
  );

  const allParticipants = useMemo(() => {
    if (!registrations) return [];
    const participants: { id: string; name: string; photo?: string; type: string }[] = [];
    registrations.docs.forEach(doc => {
      const rider = { id: doc.id, ...doc.data() } as Registration;
      participants.push({
        id: `${rider.id}-1`,
        name: rider.fullName,
        photo: rider.photoURL,
        type: rider.registrationType === 'duo' ? 'Duo Rider' : 'Solo Rider'
      });
      if (rider.registrationType === 'duo' && rider.fullName2) {
        participants.push({
          id: `${rider.id}-2`,
          name: rider.fullName2,
          photo: rider.photoURL2,
          type: 'Duo Co-rider'
        });
      }
    });
    return participants;
  }, [registrations]);

  if (loading) {
    return (
       <Card>
           <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline">Registered Riders</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <RiderSkeleton />
              </div>
           </CardContent>
       </Card>
    );
  }

  if (error) {
    // Silently fail to avoid breaking the page for a non-critical component.
    console.error("Error loading registered riders:", error);
    return null;
  }
  
  if (allParticipants.length === 0) {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline">Join the Ride!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center">No riders have been approved yet. Be the first to register and see your profile here!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
       <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Registered Riders</CardTitle>
       </CardHeader>
       <CardContent>
          <Carousel
            opts={{
              align: "start",
              loop: allParticipants.length > 5,
            }}
            className="w-full"
          >
            <CarouselContent>
              {allParticipants.map((rider) => (
                <CarouselItem key={rider.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6 gap-2 aspect-square">
                        <Avatar className="w-24 h-24 border-4 border-primary/50">
                          <AvatarImage src={rider.photo} alt={rider.name} />
                          <AvatarFallback>
                            <User className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-base font-semibold text-center truncate w-full px-1">{rider.name}</p>
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
                    <Button variant="outline">View All Riders ({allParticipants.length})</Button>
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
                            {allParticipants.map((rider) => (
                                <div key={rider.id} className="flex items-center gap-4 p-2 border rounded-md">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={rider.photo} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{rider.name}</p>
                                        <p className="text-sm text-muted-foreground">{rider.type}</p>
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

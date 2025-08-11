
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
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
    <CarouselItem className="basis-1/3 md:basis-1/4 lg:basis-1/5">
        <div className="p-1">
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-2 aspect-square">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                </CardContent>
            </Card>
        </div>
    </CarouselItem>
);

export function RegisteredRiders() {
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), where('status', '==', 'approved'))
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

  if (error) {
    console.error("Error loading registered riders:", error);
    return null;
  }
  
  if (loading || allParticipants.length === 0) {
    return null;
  }

  return (
    <Card>
       <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Our Registered Riders ({allParticipants.length})</CardTitle>
       </CardHeader>
       <CardContent>
          <Carousel
            opts={{
              align: "start",
              loop: allParticipants.length > 7,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {loading ? [...Array(5)].map((_, i) => <RiderSkeleton key={i} />)
              : allParticipants.map((rider) => (
                <CarouselItem key={rider.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-2 sm:p-4 gap-2 aspect-square">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/50">
                          <AvatarImage src={rider.photo} alt={rider.name} />
                          <AvatarFallback>
                            <User className="w-8 h-8 sm:w-10 sm:h-10" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs sm:text-sm font-semibold text-center truncate w-full px-1">{rider.name}</p>
                      </CardContent>
                    </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>

          <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1 sm:hidden">
              Scroll to see more <MoveRight className="h-3 w-3" />
          </p>

          <div className="text-center mt-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">View All Riders</Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>All Registered Riders</SheetTitle>
                        <SheetDescription>
                            Here are all the amazing riders who have joined the event.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
                        <div className="space-y-3">
                            {allParticipants.map((rider) => (
                                <div key={rider.id} className="flex items-center gap-3 p-2 border rounded-md">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={rider.photo} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold">{rider.name}</p>
                                        <p className="text-xs text-muted-foreground">{rider.type}</p>
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

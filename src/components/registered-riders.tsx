
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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User } from 'lucide-react';
import { useMemo } from 'react';

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
    <div className="w-full">
      <h2 className="text-2xl font-bold font-headline text-center mb-4">registered riders</h2>
      <Carousel
        opts={{
          align: "start",
          loop: approvedRiders.length > 5, // Only loop if there are enough riders to scroll
        }}
        className="w-full"
      >
        <CarouselContent>
          {approvedRiders.map((rider) => (
            <CarouselItem key={rider.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-3 gap-2 aspect-square">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={rider.photoURL} alt={rider.fullName} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-center truncate w-full px-1">{rider.fullName}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}

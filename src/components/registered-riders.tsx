
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
  const approvedRidersQuery = useMemo(() => 
    query(
      collection(db, 'registrations'), 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    ), 
  []);

  const [registrations, loading, error] = useCollection(approvedRidersQuery);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-secondary/50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Loading Registered Riders...</p>
      </div>
    );
  }

  if (error || !registrations || registrations.docs.length === 0) {
    // Don't show anything if there's an error or no riders
    return null;
  }

  const riders = registrations.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold font-headline text-center mb-4">Our Community of Riders</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {riders.map((rider) => (
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
                    <p className="text-sm font-semibold text-center truncate w-full">{rider.fullName}</p>
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

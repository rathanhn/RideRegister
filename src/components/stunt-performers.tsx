
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { StuntPerformer } from "@/lib/types";
import { Users, AlertTriangle, Phone, User, Rocket } from "lucide-react";
import { CardHeader, CardTitle } from "./ui/card";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { Button } from "./ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

const PerformerSkeleton = () => (
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
        <div className="p-1">
            <Card className="text-center">
                <CardContent className="flex flex-col items-center aspect-square justify-center p-6">
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md mt-2" />
                </CardContent>
            </Card>
        </div>
    </CarouselItem>
);

export function StuntPerformers() {
  const [performerData, loading, error] = useCollection(
    query(collection(db, 'stuntPerformers'), orderBy('createdAt', 'asc'))
  );

  const performers = performerData?.docs.map(doc => ({ id: doc.id, ...doc.data() } as StuntPerformer)) || [];

  if (loading) {
      return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Rocket className="h-6 w-6 text-primary" />
                    Performed By
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <Carousel className="w-full"><CarouselContent><PerformerSkeleton /><PerformerSkeleton /><PerformerSkeleton /></CarouselContent></Carousel>
            </CardContent>
        </Card>
      )
  }

  if (error || performers.length === 0) {
    return null;
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 font-headline">
          <Rocket className="h-6 w-6 text-primary" />
          Performed By
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {error && <p className="text-destructive"><AlertTriangle/> Error loading performers.</p>}
            {performers.map((performer) => (
              <CarouselItem key={performer.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                       <Avatar className="h-[120px] w-[120px] border-4 border-primary/50 text-4xl">
                           <AvatarImage src={performer.imageUrl} alt={performer.name} className="object-cover"/>
                           <AvatarFallback><User /></AvatarFallback>
                       </Avatar>
                      <h3 className="text-lg font-semibold">{performer.name}</h3>
                      <p className="text-sm text-muted-foreground">{performer.role}</p>
                      {performer.contactNumber && (
                        <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link href={`tel:${performer.contactNumber}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Contact
                            </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}

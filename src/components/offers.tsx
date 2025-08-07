
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2, AlertTriangle, Tag } from "lucide-react";
import type { Offer } from "@/lib/types";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

const OfferSkeleton = () => (
    <Card className="overflow-hidden">
        <div className="w-full h-[200px] bg-muted animate-pulse" />
        <CardHeader>
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-full bg-muted animate-pulse rounded-md mt-2" />
        </CardHeader>
        <CardFooter>
            <div className="h-6 w-1/4 bg-muted animate-pulse rounded-full" />
        </CardFooter>
    </Card>
);


export function Offers() {
  const [promotions, loading, error] = useCollection(
    query(collection(db, 'promotions'), orderBy('createdAt', 'desc'))
  );

  const offers = promotions?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Gift className="h-6 w-6 text-primary" />
          Shop Promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <OfferSkeleton />}
        {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Error loading promotions.</p>}
        {!loading && offers.length === 0 && <p className="text-sm text-center text-muted-foreground">No active promotions.</p>}
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
             <Image
                alt={offer.title}
                className="w-full h-auto object-cover aspect-[3/2]"
                height="200"
                src={offer.imageUrl}
                width="400"
                data-ai-hint={offer.imageHint}
              />
            <CardHeader>
              <CardTitle>{offer.title}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-baseline gap-2">
                {offer.offerPrice && (
                    <>
                        <p className="text-2xl font-bold">₹{offer.offerPrice}</p>
                        {offer.actualPrice && <p className="text-md text-muted-foreground line-through">₹{offer.actualPrice}</p>}
                    </>
                )}
            </CardContent>
            <CardFooter>
              <Badge variant="outline">{offer.validity}</Badge>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

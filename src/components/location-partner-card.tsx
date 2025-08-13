
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LocationPartner } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';

const PartnerSkeleton = () => (
    <Card className="border-none shadow-none">
        <CardHeader>
            <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Skeleton className="w-full sm:w-1/3 aspect-video rounded-lg" />
                <div className="space-y-4 flex-grow">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export function LocationPartnerCard() {
  const [partners, loading, error] = useCollection(
    query(collection(db, 'locationPartners'), orderBy('createdAt', 'asc'),)
  );

  const partner = partners?.docs[0]?.data() as LocationPartner | undefined;

  if (loading) {
    return <PartnerSkeleton />;
  }

  if (error || !partner) {
    return null; // Don't render the card if there's an error or no partner
  }

  return (
    <Card className="border-none shadow-none">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <MapPin className="h-6 w-6 text-primary" />
                Our Location Partner
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Image
                    src={partner.imageUrl}
                    alt={partner.name}
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full sm:w-1/3 aspect-video"
                    data-ai-hint={partner.imageHint}
                />
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{partner.name}</h3>
                    <p className="text-muted-foreground">
                        We are proud to partner with {partner.name} as the official start and end point for our event.
                    </p>
                    {partner.websiteUrl && (
                        <Button asChild>
                            <Link href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Website
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

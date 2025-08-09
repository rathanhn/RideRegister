
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Share2, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LocationSettings } from "@/lib/types";

export function RouteMap() {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [location, loading, error] = useDocument(doc(db, 'settings', 'route'));

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const locationData = location?.data() as LocationSettings | undefined;
  const origin = locationData?.origin || "Telefun Mobiles, Mahadevpet, Madikeri";
  const destination = locationData?.destination || "Nisargadhama, Kushalnagar";
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  const viewMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RideRegister Route",
          text: `Check out the route for the Independence Day Ride: ${origin} to ${destination}`,
          url: viewMapUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({
          variant: "destructive",
          title: "Share Failed",
          description: "Could not share the route at this time.",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <MapPin className="h-6 w-6 text-primary" />
          Ride Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
             <p className="text-muted-foreground mb-4">Loading route details...</p>
        ) : (
            <p className="text-muted-foreground mb-4">
                The ride will start from <strong>{origin}</strong> and go to <strong>{destination}</strong>.
            </p>
        )}
        <div className="overflow-hidden rounded-lg border aspect-video">
          {loading ? (
             <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
          ) : error ? (
            <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                <p className="text-destructive-foreground flex items-center gap-2"><AlertTriangle /> Could not load route.</p>
            </div>
          ) : apiKey ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}>
            </iframe>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Please add your Google Maps API Key to the .env file to display the map.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button asChild className="w-full" disabled={!locationData}>
                <Link href={viewMapUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Google Maps
                </Link>
            </Button>
            {isShareSupported && (
                <Button onClick={handleShare} variant="outline" className="w-full" disabled={!locationData}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Route
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

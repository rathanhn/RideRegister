
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Share2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function RouteMap() {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const origin = "Telefun Mobiles, Mahadevpet, Madikeri";
  const destination = "Nisargadhama, Kushalnagar";
  
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
        <p className="text-muted-foreground mb-4">
            The ride will start from Telefun Mobiles in Madikeri and go to Nisargadhama in Kushalnagar.
        </p>
        <div className="overflow-hidden rounded-lg border aspect-video">
          {apiKey ? (
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
            <Button asChild className="w-full">
                <Link href={viewMapUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Google Maps
                </Link>
            </Button>
            {isShareSupported && (
                <Button onClick={handleShare} variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Route
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Share2, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface MapData {
    origin: string;
    destination: string;
    mapSrc: string;
    viewMapUrl: string;
}

export function RouteMap() {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.share) {
      setIsShareSupported(true);
    }
    
    const fetchMapUrl = async () => {
        try {
            const response = await fetch('/api/map-url');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch map data.');
            }
            const data: MapData = await response.json();
            setMapData(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    fetchMapUrl();
  }, []);

  const handleShare = async () => {
    if (navigator.share && mapData) {
      try {
        await navigator.share({
          title: "RideRegister Route",
          text: `Check out the route for the Independence Day Ride: ${mapData.origin} to ${mapData.destination}`,
          url: mapData.viewMapUrl,
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
        ) : mapData ? (
            <p className="text-muted-foreground mb-4">
                The ride will start from <strong>{mapData.origin}</strong> and go to <strong>{mapData.destination}</strong>.
            </p>
        ) : (
            <p className="text-destructive mb-4">Could not load route information.</p>
        )}
        <div className="overflow-hidden rounded-lg border aspect-video">
          {loading ? (
             <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
          ) : error || !mapData ? (
            <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <p className="font-semibold text-destructive-foreground">Could not load map.</p>
                <p className="text-sm text-muted-foreground">{error || "Please check server configuration."}</p>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapData.mapSrc}>
            </iframe>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button asChild className="w-full" disabled={!mapData}>
                <Link href={mapData?.viewMapUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Google Maps
                </Link>
            </Button>
            {isShareSupported && (
                <Button onClick={handleShare} variant="outline" className="w-full" disabled={!mapData}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Route
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

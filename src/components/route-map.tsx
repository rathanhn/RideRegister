
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function RouteMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const origin = "Telefun Mobiles, Mahadevpet, Madikeri";
  const destination = "Nisargadhama, Kushalnagar";
  
  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

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
              src={mapSrc}>
            </iframe>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Please add your Google Maps API Key to the .env file to display the map.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

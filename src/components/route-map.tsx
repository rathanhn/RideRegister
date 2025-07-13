import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function RouteMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <MapPin className="h-6 w-6 text-primary" />
          Ride Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">The ride will start from Telefun Mobiles in Madikeri and go to Nisargadhama in Kushalnagar. The final route will be confirmed on the event day.</p>
        <div className="overflow-hidden rounded-lg border">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="Ride Route Map"
            width={1200}
            height={600}
            className="w-full"
            data-ai-hint="city map"
          />
        </div>
      </CardContent>
    </Card>
  );
}

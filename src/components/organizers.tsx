import Image from "next/image";
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
import type { Organizer } from "@/lib/types";
import { Users } from "lucide-react";
import { CardHeader, CardTitle } from "./ui/card";

const organizers: Organizer[] = [
  {
    id: 1,
    name: "Sunil Kumar",
    role: "Event Coordinator",
    imageUrl: "https://placehold.co/400x400.png",
    imageHint: "man portrait",
  },
  {
    id: 2,
    name: "Praveen",
    role: "Lead Volunteer",
    imageUrl: "https://placehold.co/400x400.png",
    imageHint: "man portrait",
  },
  {
    id: 3,
    name: "TeleFun Team",
    role: "Sponsor & Support",
    imageUrl: "https://placehold.co/400x400.png",
    imageHint: "group photo",
  },
];

export function Organizers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Users className="h-6 w-6 text-primary" />
          Meet the Organizers
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
            {organizers.map((organizer) => (
              <CarouselItem key={organizer.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center aspect-square justify-center p-6">
                       <Image
                          src={organizer.imageUrl}
                          alt={organizer.name}
                          width={120}
                          height={120}
                          className="rounded-full border-4 border-primary/50 mb-4"
                          data-ai-hint={organizer.imageHint}
                        />
                      <h3 className="text-lg font-semibold">{organizer.name}</h3>
                      <p className="text-sm text-muted-foreground">{organizer.role}</p>
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

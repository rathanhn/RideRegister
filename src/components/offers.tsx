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
import { Gift } from "lucide-react";
import type { Offer } from "@/lib/types";

const offers: Offer[] = [
  {
    id: 1,
    title: "Free Riding Gloves!",
    description: "Buy any new smartphone and get a pair of high-quality riding gloves for free.",
    validity: "Valid until 15th August",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "riding gloves",
  },
];

export function Offers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Gift className="h-6 w-6 text-primary" />
          Shop Promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
             <Image
                alt={offer.title}
                className="w-full h-auto object-cover"
                height="200"
                src={offer.imageUrl}
                width="400"
                data-ai-hint={offer.imageHint}
              />
            <CardHeader>
              <CardTitle>{offer.title}</CardTitle>
              <CardDescription>{offer.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Badge variant="outline">{offer.validity}</Badge>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

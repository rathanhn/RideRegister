import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Watch, Wrench, MessageCircle } from "lucide-react";

export function StoreDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          Visit Us
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center gap-4">
        <Image
          src="/telefun-logo.png"
          alt="TeleFun Mobile Logo"
          width={100}
          height={100}
          className="rounded-full border-2 border-primary p-1"
        />
        <div className="space-y-1">
            <h3 className="font-bold text-xl text-primary">Telefun Mobiles</h3>
            <p className="text-sm text-muted-foreground">Shopping & Retail</p>
        </div>
        <CardDescription className="text-sm">
            Your One-Stop Mobile Shop for Apple products, smartphones, repairs, smartwatches & accessories.
        </CardDescription>
        <Button asChild className="w-full bg-green-500 hover:bg-green-600">
            <Link href="https://wa.me/916363148287" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Connect on WhatsApp
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

import { Megaphone, CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Announcement } from "@/lib/types";

const announcements: Announcement[] = [
  {
    id: 1,
    message: "Helmets are mandatory for all riders. No exceptions!",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    message: "Please assemble at the TeleFun Mobile Store by 6:00 AM sharp.",
    timestamp: "1 day ago",
  },
  {
    id: 3,
    message: "Carry a water bottle to stay hydrated during the ride.",
    timestamp: "2 days ago",
  },
  {
    id: 4,
    message: "The ride route map will be shared on the morning of the event.",
    timestamp: "3 days ago",
  },
];

export function Announcements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Megaphone className="h-6 w-6 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full">
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div key={announcement.id}>
                <div className="flex flex-col gap-2 p-1">
                  <p className="text-sm">{announcement.message}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <CalendarClock className="h-3 w-3" />
                    <span>{announcement.timestamp}</span>
                  </div>
                </div>
                {index < announcements.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

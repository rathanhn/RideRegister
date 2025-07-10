
"use client";

import { Megaphone, CalendarClock, Loader2, AlertTriangle, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Announcement } from "@/lib/types";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";

export function Announcements() {
  const [announcements, loading, error] = useCollection(
    query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
  );

  const announcementDocs = announcements?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)) || [];

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
            {loading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Error loading.</p>}
            {!loading && announcementDocs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No announcements yet. Check back soon!</p>
            )}
            {announcementDocs.map((announcement, index) => (
              <div key={announcement.id}>
                <div className="flex flex-col gap-2 p-1">
                  <p className="text-sm">{announcement.message}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                    <User className="h-3 w-3" />
                    <span>
                      {announcement.adminName}
                    </span>
                    <Badge variant="secondary" className="capitalize text-xs">{announcement.adminRole}</Badge>
                    <span>&middot;</span>
                     <span>
                      {announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </span>
                  </div>
                </div>
                {index < announcementDocs.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

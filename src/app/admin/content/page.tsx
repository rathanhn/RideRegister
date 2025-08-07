
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleManager } from "./schedule-manager";
import { OrganizerManager } from "./organizer-manager";
import { PromotionManager } from "./promotion-manager";

export default function ContentManagement() {
  return (
    <Tabs defaultValue="schedule" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="schedule">Event Schedule</TabsTrigger>
        <TabsTrigger value="organizers">Organizers</TabsTrigger>
        <TabsTrigger value="promotions">Promotions</TabsTrigger>
      </TabsList>
      <TabsContent value="schedule">
        <ScheduleManager />
      </TabsContent>
      <TabsContent value="organizers">
        <OrganizerManager />
      </TabsContent>
      <TabsContent value="promotions">
        <PromotionManager />
      </TabsContent>
    </Tabs>
  );
}

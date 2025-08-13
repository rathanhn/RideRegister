
"use client";

import { ScheduleManager } from "./schedule-manager";
import { OrganizerManager } from "./organizer-manager";
import { PromotionManager } from "./promotion-manager";
import { LocationManager } from "./location-manager";
import { EventTimeManager } from "./event-time-manager";
import { GeneralSettingsManager } from "@/components/admin/general-settings-manager";
import { StuntPerformerManager } from "./stunt-performer-manager";


export default function ContentManagement() {
  return (
    <div className="space-y-8">
        <GeneralSettingsManager />
        <ScheduleManager />
        <OrganizerManager />
        <StuntPerformerManager />
        <PromotionManager />
        <LocationManager />
        <EventTimeManager />
    </div>
  );
}

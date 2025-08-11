
"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RegistrationsTable } from '@/components/admin/registrations-table';
import { AdminQna } from '@/components/admin/admin-qna';
import { StatsOverview } from '@/components/admin/stats-overview';
import { QrScanner } from '@/components/admin/qr-scanner';
import { ScanLine, Users, Loader2, List, FileCheck, MessageSquare, Megaphone, UserCheck, Flag, Settings, Calendar, MapPin, Gift, UserCog, Blocks, Settings2 } from 'lucide-react';
import { UserRolesManager } from '@/components/admin/user-roles-manager';
import type { UserRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { RidersListTable } from '@/components/admin/riders-list-table';
import { AnnouncementManager } from '@/components/admin/announcement-manager';
import { CheckedInListTable } from '@/components/admin/checked-in-list-table';
import { FinishersListTable } from '@/components/admin/finishers-list-table';
import { ScheduleManager } from "./content/schedule-manager";
import { OrganizerManager } from "./content/organizer-manager";
import { PromotionManager } from "./content/promotion-manager";
import { LocationManager } from "./content/location-manager";
import { EventTimeManager } from "./content/event-time-manager";
import { GeneralSettingsManager } from '@/components/admin/general-settings-manager';

export default function AdminPage() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role as UserRole);
        }
      };
      fetchUserRole();
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Admin Management</h1>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : userRole ? (
                 <Badge variant="outline">Logged in as: <span className="capitalize ml-1 font-semibold">{userRole}</span></Badge>
            ) : null}
        </div>
        
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Settings2 className="h-6 w-6 text-primary"/> General Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GeneralSettingsManager />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><FileCheck className="h-6 w-6 text-primary"/> Manage Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RegistrationsTable />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Megaphone className="h-6 w-6 text-primary"/>Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementManager />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Calendar className="h-6 w-6 text-primary"/> Event Schedule</CardTitle>
                        <CardDescription>Manage the timeline of events for the ride day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScheduleManager />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Gift className="h-6 w-6 text-primary"/> Promotions</CardTitle>
                         <CardDescription>Create and manage special offers for the shop.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PromotionManager />
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ScanLine className="h-6 w-6 text-primary" />
                            Ticket Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QrScanner />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6 text-primary"/> User Role Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserRolesManager />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><UserCog className="h-6 w-6 text-primary"/> Organizers</CardTitle>
                        <CardDescription>Add or remove members of the organizing team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrganizerManager />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><MapPin className="h-6 w-6 text-primary"/> Location & Time</CardTitle>
                         <CardDescription>Set the core details for the event countdown and map.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <LocationManager />
                        <EventTimeManager />
                    </CardContent>
                </Card>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><List className="h-6 w-6 text-primary"/>Approved Riders List</CardTitle>
            </CardHeader>
            <CardContent>
                <RidersListTable />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><UserCheck className="h-6 w-6 text-primary"/>Checked-In Riders</CardTitle>
            </CardHeader>
            <CardContent>
                <CheckedInListTable />
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Flag className="h-6 w-6 text-primary"/>Finishers List</CardTitle>
            </CardHeader>
            <CardContent>
                <FinishersListTable />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><MessageSquare className="h-6 w-6 text-primary"/>Community Q&amp;A</CardTitle>
            </CardHeader>
            <CardContent>
                <AdminQna />
            </CardContent>
        </Card>
        
      </main>
    </div>
  );
}

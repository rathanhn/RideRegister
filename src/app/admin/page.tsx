
"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationsTable } from '@/components/admin/registrations-table';
import { AdminQna } from '@/components/admin/admin-qna';
import { StatsOverview } from '@/components/admin/stats-overview';
import { QrScanner } from '@/components/admin/qr-scanner';
import { ScanLine, Users, Loader2, List, FileCheck, MessageSquare, Megaphone } from 'lucide-react';
import { UserRolesManager } from '@/components/admin/user-roles-manager';
import type { UserRole } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { RidersListTable } from '@/components/admin/riders-list-table';
import { AnnouncementManager } from '@/components/admin/announcement-manager';

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
            <p className="text-muted-foreground">Manage event registrations, Q&A, and view statistics.</p>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : userRole ? (
                 <Badge variant="outline">Logged in as: <span className="capitalize ml-1 font-semibold">{userRole}</span></Badge>
            ) : null}
        </div>
        
        <div className="grid grid-cols-1 gap-8">
            <StatsOverview />

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><FileCheck className="h-6 w-6 text-primary"/> Manage Registrations</CardTitle>
                    <CardDescription>
                        Review pending applications and manage cancellation requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegistrationsTable />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><List className="h-6 w-6 text-primary"/>Registered Riders</CardTitle>
                    <CardDescription>
                        View, contact, or remove all approved riders for the event.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RidersListTable />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScanLine className="h-6 w-6 text-primary" />
                        Ticket Scanner
                    </CardTitle>
                    <CardDescription>
                    Scan rider tickets for real-time check-in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QrScanner />
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
              <CardTitle className='flex items-center gap-2'><Megaphone className="h-6 w-6 text-primary"/>Announcements</CardTitle>
              <CardDescription>
                  Create and delete event announcements.
              </CardDescription>
              </CardHeader>
              <CardContent>
                  <AnnouncementManager />
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
              <CardTitle className='flex items-center gap-2'><MessageSquare className="h-6 w-6 text-primary"/>Community Q&A</CardTitle>
              <CardDescription>
                  Respond to user questions and manage conversations.
              </CardDescription>
              </CardHeader>
              <CardContent>
              <AdminQna />
              </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6 text-primary"/> User Role Management</CardTitle>
                <CardDescription>
                Assign roles to users. This section is only visible to Super Admins.
                </CardDescription>
            </Header>
            <CardContent>
                <UserRolesManager />
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}


import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationsTable } from '@/components/admin/registrations-table';
import { AdminQna } from '@/components/admin/admin-qna';
import { StatsOverview } from '@/components/admin/stats-overview';
import { QrScanner } from '@/components/admin/qr-scanner';
import { ScanLine, Users } from 'lucide-react';
import { UserRolesManager } from '@/components/admin/user-roles-manager';

export default function AdminPage() {
  // NOTE: In a real app, you'd fetch the user's role here and conditionally
  // render components based on their permissions. For this prototype, we will
  // show all components and handle permissions within each component itself.
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
            <p className="text-muted-foreground">Manage event registrations, Q&A, and view statistics.</p>
        </div>
        
        <StatsOverview />

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6 text-primary"/> User Role Management</CardTitle>
            <CardDescription>
              Assign roles to users. This section is only visible to Super Admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRolesManager />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Event Registrations</CardTitle>
            <CardDescription>
                Approve, reject, and manage all event registrations.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <RegistrationsTable />
            </CardContent>
        </Card>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
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
                <CardTitle>Community Q&A</CardTitle>
                <CardDescription>
                    Respond to user questions and manage conversations.
                </CardDescription>
                </Header>
                <CardContent>
                <AdminQna />
                </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}

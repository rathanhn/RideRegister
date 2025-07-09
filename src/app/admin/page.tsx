import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationsTable } from '@/components/admin/registrations-table';
import { AdminQna } from '@/components/admin/admin-qna';
import { StatsOverview } from '@/components/admin/stats-overview';

export default function AdminPage() {
  // NOTE: This is a placeholder page. In a real application, you would protect
  // this route to ensure only authenticated administrators can access it.
  // This could be done using Next.js Middleware or a higher-order component.
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">A complete overview of your event.</p>
        </div>
        
        <StatsOverview />

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Registrations</CardTitle>
                    <CardDescription>
                      View and manage all event registrations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegistrationsTable />
                  </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                   <CardHeader>
                    <CardTitle>Community Q&A</CardTitle>
                    <CardDescription>
                      Respond to user questions and manage conversations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminQna />
                  </CardContent>
                </Card>
            </div>
        </div>

      </main>
    </div>
  );
}

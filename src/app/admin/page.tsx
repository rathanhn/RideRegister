import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationsTable } from '@/components/admin/registrations-table';

export default function AdminPage() {
  // NOTE: This is a placeholder page. In a real application, you would protect
  // this route to ensure only authenticated administrators can access it.
  // This could be done using Next.js Middleware or a higher-order component.
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              View and manage all event registrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationsTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

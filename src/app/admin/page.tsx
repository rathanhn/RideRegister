import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  // NOTE: This is a placeholder page.
  // In a real application, you would protect this route and fetch
  // admin-specific data, like all registrations.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome, Admin!</p>
            <p className="text-muted-foreground">
              This is where you would manage event registrations and other administrative tasks.
              Building out this functionality can be our next step.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

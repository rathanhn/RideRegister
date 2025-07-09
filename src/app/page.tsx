import { Header } from "@/components/header";
import { RegistrationForm } from "@/components/registration-form";
import { Announcements } from "@/components/announcements";
import { Offers } from "@/components/offers";
import { AiAssistant } from "@/components/ai-assistant";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RegistrationForm />
          </div>
          <div className="flex flex-col gap-8">
            <Announcements />
            <Offers />
          </div>
        </div>
        <div className="mt-8">
          <AiAssistant />
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} TeleFun Mobile. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

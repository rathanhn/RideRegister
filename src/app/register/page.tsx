
"use client";

import { useState } from 'react';
import { RegistrationForm } from '@/components/registration-form';
import { Header } from '@/components/header';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OrganizerAgreementForm } from '@/components/organizer-agreement-form';

export default function RegisterPage() {
  const [isOrganizer, setIsOrganizer] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
         <div className="w-full max-w-2xl mx-auto py-8 space-y-6">
             <div className="flex items-center justify-center space-x-3">
                <Label htmlFor="form-toggle" className={!isOrganizer ? 'text-primary' : 'text-muted-foreground'}>
                    Register as Rider
                </Label>
                <Switch
                    id="form-toggle"
                    checked={isOrganizer}
                    onCheckedChange={setIsOrganizer}
                    aria-label="Toggle between rider and organizer registration"
                />
                <Label htmlFor="form-toggle" className={isOrganizer ? 'text-primary' : 'text-muted-foreground'}>
                    Become an Organizer
                </Label>
            </div>
            
            {isOrganizer ? <OrganizerAgreementForm /> : <RegistrationForm />}

         </div>
      </div>
    </div>
  );
}

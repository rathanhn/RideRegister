
"use client";

import { useState } from 'react';
import { RegistrationForm } from '@/components/registration-form';
import { Header } from '@/components/header';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Bike, Shield } from 'lucide-react';
import { OrganizerAgreementForm } from '@/components/organizer-agreement-form';

export default function RegisterPage() {
  const [formType, setFormType] = useState<'rider' | 'organizer'>('rider');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
         <div className="w-full max-w-2xl mx-auto py-8 space-y-6">
            <RadioGroup
                defaultValue="rider"
                onValueChange={(value: 'rider' | 'organizer') => setFormType(value)}
                className="grid grid-cols-2 gap-4"
            >
                <div>
                    <RadioGroupItem value="rider" id="rider" className="peer sr-only" />
                    <Label
                    htmlFor="rider"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                     <Bike className="mb-3 h-6 w-6" />
                    Register as Rider
                    </Label>
                </div>
                <div>
                    <RadioGroupItem
                    value="organizer"
                    id="organizer"
                    className="peer sr-only"
                    />
                    <Label
                    htmlFor="organizer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                    <Shield className="mb-3 h-6 w-6" />
                    Become an Organizer
                    </Label>
                </div>
            </RadioGroup>
            
            {formType === 'rider' ? <RegistrationForm /> : <OrganizerAgreementForm />}

         </div>
      </div>
    </div>
  );
}

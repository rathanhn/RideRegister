
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Loader2, AlertTriangle, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import type { EventSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function GeneralSettingsManager() {
  const [user, authLoading] = useAuthState(auth);
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const docRef = doc(db, 'settings', 'event');
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setEventSettings(docSnap.data() as EventSettings);
        } else {
          // Default settings if document doesn't exist
          setEventSettings({ startTime: new Date(), registrationsOpen: true });
        }
        setLoading(false);
      },
      (err) => {
        setError("Failed to load settings.");
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleRegistration = async () => {
    if (!user || !eventSettings) return;
    setIsUpdating(true);
    
    const newStatus = !eventSettings.registrationsOpen;
    
    try {
      await setDoc(doc(db, "settings", "event"), {
        ...eventSettings,
        registrationsOpen: newStatus
      }, { merge: true });

      toast({
        title: "Success",
        description: `Registrations are now ${newStatus ? 'OPEN' : 'CLOSED'}.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update registration status.",
      });
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const isLoading = loading || authLoading;
  const isRegistrationsOpen = eventSettings?.registrationsOpen ?? true;

  if (isLoading) {
    return <div className="flex justify-center items-center h-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  
  if (error) {
     return <div className="text-destructive flex items-center gap-2"><AlertTriangle/> {error}</div>
  }

  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center bg-secondary/50">
        <div>
            <h4 className="font-semibold">Registration Status</h4>
            <p className="text-sm text-muted-foreground">
                Control whether new users can register for the event.
            </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
             <Badge variant={isRegistrationsOpen ? "default" : "destructive"}>
                {isRegistrationsOpen ? 'Open' : 'Closed'}
             </Badge>
            <Button onClick={handleToggleRegistration} disabled={isUpdating} variant="outline">
                {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isRegistrationsOpen ? (
                    <ToggleLeft className="mr-2 h-4 w-4" />
                ) : (
                    <ToggleRight className="mr-2 h-4 w-4" />
                )}
                {isRegistrationsOpen ? 'Close Registrations' : 'Open Registrations'}
            </Button>
        </div>
    </div>
  );
}

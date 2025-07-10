
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2, Trash2, AlertTriangle, Send } from 'lucide-react';
import type { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addAnnouncement, deleteAnnouncement } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const announcementSchema = z.object({
  message: z.string().min(5, "Min 5 characters.").max(280, "Max 280 characters."),
});

export function AnnouncementManager() {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { message: "" },
  });
  const { isSubmitting } = form.formState;

  const [announcements, announcementsLoading, error] = useCollection(
    query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
  );

  const handleDelete = async (id: string) => {
    if (!user) return;
    const result = await deleteAnnouncement({ adminId: user.uid, announcementId: id });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  async function onSubmit(values: z.infer<typeof announcementSchema>) {
    if (!user) return;
    const result = await addAnnouncement({ adminId: user.uid, message: values.message });
    if (result.success) {
      toast({ title: 'Success', description: 'Announcement posted.' });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const isLoading = authLoading || announcementsLoading;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Type your announcement here..." {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Announcement
          </Button>
        </form>
      </Form>
      
      <Separator />

      <h4 className="text-sm font-medium text-muted-foreground">Posted Announcements</h4>
      
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-3">
          {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Error loading.</p>}
          {!isLoading && announcements?.docs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No announcements have been posted yet.</p>
          )}
          {announcements?.docs.map(doc => {
            const announcement = { id: doc.id, ...doc.data() } as Announcement;
            return (
              <div key={announcement.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg bg-background">
                <div className="flex-grow">
                    <p className="text-sm">{announcement.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDelete(announcement.id)} disabled={!user}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

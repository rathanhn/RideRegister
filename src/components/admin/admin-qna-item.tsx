
"use client";

import type { QnaQuestion, QnaReply, UserRole } from "@/lib/types";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addReply } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

const replyFormSchema = z.object({
  text: z.string().min(1, "Reply cannot be empty.").max(500),
});

interface AdminQnaItemProps {
  question: QnaQuestion;
}

export function AdminQnaItem({ question }: AdminQnaItemProps) {
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { text: "" },
  });
  const { isSubmitting } = form.formState;

  const [userRole, setUserRole] = useState<UserRole | null>(null);

   useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const canReply = userRole === 'admin' || userRole === 'superadmin';

  const [replies, repliesLoading] = useCollection(
    query(collection(db, 'qna', question.id, 'replies'), orderBy('createdAt', 'asc'))
  );
  
  async function onReplySubmit(values: z.infer<typeof replyFormSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to reply." });
        return;
    };
    if (!canReply) {
       toast({ variant: "destructive", title: "Error", description: "You don't have permission to reply." });
        return;
    }
    
    const result = await addReply({
      ...values,
      questionId: question.id,
      userId: user.uid,
      userName: user.displayName || "Admin",
      userPhotoURL: user.photoURL,
    });

    if (result.success) {
      form.reset();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }
  
  if (authLoading) return <Loader2 className="h-5 w-5 animate-spin" />

  return (
    <div className="p-4 border rounded-lg bg-background space-y-4">
        {/* Question */}
        <div className="flex gap-4">
            <Avatar>
                <AvatarImage src={question.userPhotoURL ?? undefined} alt={question.userName} />
                <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div className="w-full">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{question.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
                <p className="text-muted-foreground mt-1">{question.text}</p>
            </div>
        </div>

        {/* Replies */}
        {(replies && replies.docs.length > 0) && (
            <div className="pl-16 space-y-4">
                <Separator />
                {replies.docs.map(doc => {
                    const reply = { id: doc.id, ...doc.data() } as QnaReply;
                    return (
                        <div key={reply.id} className="flex gap-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.userPhotoURL ?? undefined} alt={reply.userName} />
                                <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-sm">{reply.userName}</p>
                                    {reply.isAdmin && <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1"/> Admin</Badge>}
                                     <p className="text-xs text-muted-foreground">
                                        {reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{reply.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        {repliesLoading && <div className="flex justify-center pl-16"><Loader2 className="h-5 w-5 animate-spin" /></div>}

        {/* Reply Form */}
       {canReply && (
         <div className="pl-16">
            <Separator />
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onReplySubmit)} className="space-y-2 pt-4">
                <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea placeholder="Write an official reply..." {...field} rows={2}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Reply
                </Button>
            </form>
            </Form>
        </div>
       )}
    </div>
  );
}

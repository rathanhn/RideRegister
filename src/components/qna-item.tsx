"use client";

import type { QnaQuestion, QnaReply } from "@/lib/types";
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addReply } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { CornerDownRight, Loader2, User } from "lucide-react";
import { Separator } from "./ui/separator";

const replyFormSchema = z.object({
  text: z.string().min(1, "Reply cannot be empty.").max(500, "Reply cannot be longer than 500 characters."),
});

interface QnaItemProps {
  question: QnaQuestion;
}

export function QnaItem({ question }: QnaItemProps) {
  const [user] = useAuthState(auth);
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { text: "" },
  });
  const { isSubmitting } = form.formState;

  const [replies, repliesLoading] = useCollection(
    query(collection(db, 'qna', question.id, 'replies'), orderBy('createdAt', 'asc'))
  );
  
  async function onReplySubmit(values: z.infer<typeof replyFormSchema>) {
    if (!user) return;
    
    const result = await addReply({
      ...values,
      questionId: question.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userPhotoURL: user.photoURL,
    });

    if (result.success) {
      form.reset();
      setIsReplying(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }
  
  return (
    <div className="p-4 border rounded-lg space-y-4">
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
                {user && (
                  <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={() => setIsReplying(!isReplying)}>
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                )}
            </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
             <div className="pl-16">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onReplySubmit)} className="space-y-2">
                        <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea placeholder="Write a reply..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Reply
                            </Button>
                             <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
             </div>
        )}

        {/* Replies */}
        {replies && replies.docs.length > 0 && (
            <div className="pl-8 space-y-4">
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
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{reply.userName}</p>
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
    </div>
  );
}

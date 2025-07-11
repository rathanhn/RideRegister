
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { QnaQuestion } from '@/lib/types';
import { AdminQnaItem } from './admin-qna-item';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const QnaSkeleton = () => (
    <Card className="p-4 space-y-4">
        <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
         <div className="pl-16 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </Card>
)

export function AdminQna() {
  const [questions, questionsLoading, questionsError] = useCollection(
    query(collection(db, 'qna'), orderBy('isPinned', 'desc'))
  );

  return (
    <div className="space-y-6">
      {questionsLoading && (
        <div className="space-y-4">
            <QnaSkeleton />
            <QnaSkeleton />
        </div>
      )}
      {questionsError && <p className="text-destructive">Error loading questions: {questionsError.message}</p>}
      {questions && questions.docs.length === 0 && (
         <p className="text-muted-foreground text-center py-4">No questions have been asked yet.</p>
      )}
      <div className="space-y-4">
        {questions?.docs.map(doc => (
          <AdminQnaItem key={doc.id} question={{ id: doc.id, ...doc.data() } as QnaQuestion} />
        ))}
      </div>
    </div>
  );
}


"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { QnaQuestion } from '@/lib/types';
import { AdminQnaItem } from './admin-qna-item';

export function AdminQna() {
  const [questions, questionsLoading, questionsError] = useCollection(
    query(collection(db, 'qna'), orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'))
  );

  return (
    <div className="space-y-6">
      {questionsLoading && <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>}
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


"use client";

import { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Edit, Trash2, PlusCircle } from 'lucide-react';
import type { ScheduleEvent } from '@/lib/types';
import { ScheduleForm } from './schedule-form';

export function ScheduleManager() {
  const [schedule, loading, error] = useCollection(query(collection(db, 'schedule'), orderBy('createdAt', 'asc')));
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleEvent | null>(null);

  const scheduleItems = schedule?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleEvent)) || [];

  const handleEdit = (item: ScheduleEvent) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Event Schedule</h3>
        <Button onClick={handleAddNew} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      <ScheduleForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        scheduleItem={selectedItem}
        user={user}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || authLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={4} className="text-center text-destructive"><AlertTriangle/> Error loading data.</TableCell></TableRow>
            ) : scheduleItems.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">No schedule items found.</TableCell></TableRow>
            ) : (
              scheduleItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.time}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

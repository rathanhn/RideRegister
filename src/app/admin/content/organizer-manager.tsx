
"use client";

import { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Edit, PlusCircle } from 'lucide-react';
import type { Organizer } from '@/lib/types';
import { OrganizerForm } from './organizer-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function OrganizerManager() {
  const [organizers, loading, error] = useCollection(query(collection(db, 'organizers'), orderBy('createdAt', 'asc')));
  const [user, authLoading] = useAuthState(auth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Organizer | null>(null);

  const organizerItems = organizers?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organizer)) || [];

  const handleEdit = (item: Organizer) => {
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
        <h3 className="text-lg font-medium">Manage Organizers</h3>
        <Button onClick={handleAddNew} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Organizer</Button>
      </div>

      <OrganizerForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        organizer={selectedItem}
        user={user}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || authLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={5} className="text-center text-destructive"><AlertTriangle/> Error loading data.</TableCell></TableRow>
            ) : organizerItems.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No organizers found.</TableCell></TableRow>
            ) : (
              organizerItems.map(item => (
                <TableRow key={item.id}>
                    <TableCell>
                        <Avatar>
                            <AvatarImage src={item.imageUrl} alt={item.name} />
                            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.role}</TableCell>
                   <TableCell>{item.contactNumber || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
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

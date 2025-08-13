
"use client";

import { useState, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Edit, PlusCircle, ShieldAlert } from 'lucide-react';
import type { StuntPerformer, UserRole } from '@/lib/types';
import { StuntPerformerForm } from './stunt-performer-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function StuntPerformerManager() {
  const [performers, loading, error] = useCollection(query(collection(db, 'stuntPerformers'), orderBy('createdAt', 'asc')));
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StuntPerformer | null>(null);

  useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(doc => {
            if (doc.exists()) {
                setUserRole(doc.data().role as UserRole);
            }
        })
    }
  }, [user]);

  const performerItems = performers?.docs.map(doc => ({ id: doc.id, ...doc.data() } as StuntPerformer)) || [];

  const handleEdit = (item: StuntPerformer) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };
  
  const canEdit = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Stunt Performers</h3>
        {canEdit && (
            <Button onClick={handleAddNew} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Performer</Button>
        )}
      </div>

      <StuntPerformerForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        performer={selectedItem}
        user={user}
        userRole={userRole}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role/Specialty</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || authLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={5} className="text-center text-destructive"><AlertTriangle/> Error loading data.</TableCell></TableRow>
            ) : performerItems.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No performers found.</TableCell></TableRow>
            ) : (
              performerItems.map(item => (
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
                    {canEdit ? (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                    ) : (
                        <span className='text-muted-foreground text-xs'>View Only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
       {!canEdit && (
            <div className="text-muted-foreground flex items-center gap-2 p-2 bg-secondary rounded-md text-xs">
                <ShieldAlert className="h-4 w-4" />
                <p>Only Admins can add, edit, or delete performers.</p>
            </div>
        )}
    </div>
  );
}

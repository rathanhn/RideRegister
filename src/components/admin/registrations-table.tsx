
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, doc, getDoc, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Check, X } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { updateRegistrationStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const TableSkeleton = () => (
    [...Array(3)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </TableCell>
        </TableRow>
    ))
);

export function RegistrationsTable() {
  // Query for all registrations, we will filter locally.
  const [registrations, loading, error] = useCollection(
      query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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
  
  const pendingRegistrations = useMemo(() => {
    if (!registrations) return [];
    return registrations.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Registration))
        .filter(reg => reg.status === 'pending');
  }, [registrations]);

  const canEdit = userRole === 'admin' || userRole === 'superadmin';

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!user || !canEdit) {
      toast({ variant: "destructive", title: "Error", description: "You don't have permission to perform this action." });
      return;
    }

    setIsUpdating(id);
    const result = await updateRegistrationStatus({ registrationId: id, status, adminId: user.uid });
    if (result.success) {
        toast({ title: "Success", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsUpdating(null);
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4">
        <AlertTriangle />
        <p>Error loading registrations: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {(loading || authLoading) ? (
                <TableSkeleton />
            ) : pendingRegistrations.length > 0 ? (
                pendingRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</TableCell>
                    <TableCell>
                    <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'}>
                        {reg.registrationType}
                    </Badge>
                    </TableCell>
                    <TableCell>{reg.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                       {!canEdit ? (
                        <div className='flex justify-end items-center gap-2 text-muted-foreground'>
                          {/* <ShieldAlert className="h-4 w-4"/> */}
                          <span>View Only</span>
                        </div>
                       ) : (
                         <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 bg-green-50 hover:bg-green-100 text-green-700"
                                onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                disabled={isUpdating === reg.id}
                            >
                                {isUpdating === reg.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                                <span className="sr-only">Approve</span>
                            </Button>
                             <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-700"
                                onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                disabled={isUpdating === reg.id}
                            >
                                {isUpdating === reg.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4" />}
                                 <span className="sr-only">Reject</span>
                            </Button>
                         </div>
                       )}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                    No pending registrations to approve.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

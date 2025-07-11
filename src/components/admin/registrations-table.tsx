
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
import { Loader2, AlertTriangle, Check, X, Ban, Trash2 } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { updateRegistrationStatus, deleteRegistration } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

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
  
  const { pendingRegistrations, cancellationRequests } = useMemo(() => {
    if (!registrations) return { pendingRegistrations: [], cancellationRequests: [] };
    const allRegs = registrations.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    return {
        pendingRegistrations: allRegs.filter(reg => reg.status === 'pending'),
        cancellationRequests: allRegs.filter(reg => reg.status === 'cancellation_requested')
    }
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

  const handleCancellation = async (id: string, approve: boolean) => {
    if (!user || !canEdit) {
      toast({ variant: "destructive", title: "Error", description: "You don't have permission to perform this action." });
      return;
    }
    setIsUpdating(id);
    if (approve) {
        // Approve cancellation -> delete registration
        const result = await deleteRegistration({ registrationId: id, adminId: user.uid });
        if (result.success) {
            toast({ title: "Cancellation Approved", description: "The registration has been deleted." });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    } else {
        // Reject cancellation -> revert status to approved
        const result = await updateRegistrationStatus({ registrationId: id, status: 'approved', adminId: user.uid });
        if (result.success) {
            toast({ title: "Cancellation Rejected", description: "The registration status has been reverted to approved." });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
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
    <div className="space-y-8">
        <div>
            <h4 className="font-semibold text-lg mb-2">Pending Approvals</h4>
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

        <Separator />
        
        <div>
            <h4 className="font-semibold text-lg mb-2">Cancellation Requests</h4>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {(loading || authLoading) ? (
                        <TableSkeleton />
                    ) : cancellationRequests.length > 0 ? (
                        cancellationRequests.map((reg) => (
                        <TableRow key={reg.id}>
                            <TableCell className="font-medium">{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</TableCell>
                            <TableCell className="text-muted-foreground max-w-sm truncate">{reg.cancellationReason}</TableCell>
                            <TableCell className="text-right">
                                {!canEdit ? (
                                    <div className='flex justify-end items-center gap-2 text-muted-foreground'>
                                        <span>View Only</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 bg-green-50 hover:bg-green-100 text-green-700"
                                            onClick={() => handleCancellation(reg.id, true)}
                                            disabled={isUpdating === reg.id}
                                        >
                                            {isUpdating === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 bg-amber-50 hover:bg-amber-100 text-amber-700"
                                            onClick={() => handleCancellation(reg.id, false)}
                                            disabled={isUpdating === reg.id}
                                        >
                                            {isUpdating === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Ban className="mr-2 h-4 w-4" />}
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            No pending cancellation requests.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </div>
    </div>
  );
}

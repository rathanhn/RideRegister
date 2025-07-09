
"use client";

import { useState, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, MoreHorizontal, ShieldAlert } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { updateRegistrationStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function RegistrationsTable() {
  const [registrations, loading, error] = useCollection(query(collection(db, 'registrations'), orderBy('createdAt', 'desc')));
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

  const allRegistrations = registrations?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[] || [];
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

  const handleExport = () => {
    if (!allRegistrations.length) return;

    const headers = [
      "ID",
      "Registration Type",
      "Status",
      "Rider 1 Name",
      "Rider 1 Age",
      "Rider 1 Phone",
      "Rider 2 Name",
      "Rider 2 Age",
      "Rider 2 Phone",
      "Registered On"
    ];

    const csvRows = [
      headers.join(','),
      ...allRegistrations.map(reg => {
        const rider1Name = `"${reg.fullName}"`;
        const rider2Name = reg.fullName2 ? `"${reg.fullName2}"` : "N/A";

        const row = [
          reg.id,
          reg.registrationType,
          reg.status ?? 'pending',
          rider1Name,
          reg.age,
          reg.phoneNumber,
          rider2Name,
          reg.age2 ?? 'N/A',
          reg.phoneNumber2 ?? 'N/A',
          reg.createdAt?.toDate().toLocaleDateString() ?? 'N/A'
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'registrations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading || authLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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
        <div className="flex justify-end mb-4">
            <Button onClick={handleExport} disabled={allRegistrations.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {allRegistrations.length > 0 ? (
                allRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.fullName}</TableCell>
                    <TableCell>
                    <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'}>
                        {reg.registrationType}
                    </Badge>
                    </TableCell>
                    <TableCell>{reg.phoneNumber}</TableCell>
                    <TableCell>
                        <Badge 
                            variant={
                                reg.status === 'approved' ? 'default' 
                                : reg.status === 'rejected' ? 'destructive' 
                                : 'secondary'
                            }
                            className="capitalize"
                        >
                            {isUpdating === reg.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                            {reg.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {!canEdit ? (
                        <div className='flex justify-end items-center gap-2 text-muted-foreground'>
                          <ShieldAlert className="h-4 w-4"/>
                          <span>View Only</span>
                        </div>
                       ) : (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating === reg.id}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                disabled={reg.status === 'approved'}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                disabled={reg.status === 'rejected'}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       )}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    No registrations found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

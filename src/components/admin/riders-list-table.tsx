
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, MessageCircle, Trash2 } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteRegistration } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

// Helper function to format WhatsApp links
const formatWhatsAppLink = (phone: string) => {
    // Remove non-digit characters and add country code if missing
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
        cleanedPhone = `91${cleanedPhone}`;
    }
    return `https://wa.me/${cleanedPhone}`;
};

const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-20" />
                </div>
            </TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-12 ml-auto" /></TableCell>
        </TableRow>
    ))
);


export function RidersListTable() {
  // Query for all registrations, we will filter locally
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role as UserRole);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const canEdit = userRole === 'admin' || userRole === 'superadmin';

  const approvedRegistrations = useMemo(() => {
    if (!registrations) return [];
    return registrations.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Registration))
      .filter(reg => reg.status === 'approved');
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    if (!searchTerm) return approvedRegistrations;
    return approvedRegistrations.filter(reg => 
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reg.fullName2 && reg.fullName2.toLowerCase().includes(searchTerm.toLowerCase())) ||
        reg.phoneNumber.includes(searchTerm) ||
        (reg.phoneNumber2 && reg.phoneNumber2.includes(searchTerm))
    );
  }, [approvedRegistrations, searchTerm]);
  
  const handleDelete = async (id: string) => {
    if (!user || !canEdit) {
      toast({ variant: 'destructive', title: 'Error', description: "Permission denied." });
      return;
    }
    setIsDeleting(id);
    const result = await deleteRegistration({ adminId: user.uid, registrationId: id });
    if (result.success) {
      toast({ title: 'Success', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsDeleting(null);
  };


  const handleExport = () => {
    if (!filteredRegistrations.length) return;

    const headers = [
      "ID", "Status", 
      "Rider 1 Name", "Rider 1 Age", "Rider 1 Phone", "Rider 1 Checked-In",
      "Rider 2 Name", "Rider 2 Age", "Rider 2 Phone", "Rider 2 Checked-In",
      "Registered On"
    ];

    const csvRows = [
      headers.join(','),
      ...filteredRegistrations.map(reg => {
        const row = [
          reg.id, reg.status,
          `"${reg.fullName}"`, reg.age, reg.phoneNumber, reg.rider1CheckedIn ? 'Yes' : 'No',
          reg.fullName2 ? `"${reg.fullName2}"` : "N/A", reg.age2 ?? "N/A", reg.phoneNumber2 ?? "N/A", reg.rider2CheckedIn ? 'Yes' : 'No',
          reg.createdAt?.toDate().toISOString() ?? 'N/A'
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'approved_riders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <Input 
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm"
            />
            <Button onClick={handleExport} disabled={filteredRegistrations.length === 0} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Rider(s)</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Check-in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {(loading || authLoading) ? (
                <TableSkeleton />
            ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                        <div>{reg.fullName}</div>
                        {reg.registrationType === 'duo' && reg.fullName2 && <div className="text-xs text-muted-foreground">{reg.fullName2}</div>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                         <div>{reg.phoneNumber}</div>
                        {reg.registrationType === 'duo' && reg.phoneNumber2 && <div className="text-xs text-muted-foreground">{reg.phoneNumber2}</div>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col gap-2">
                            <Badge variant="outline" className={`justify-center ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}>
                                P1: {reg.rider1CheckedIn ? 'Checked-in' : 'Pending'}
                            </Badge>
                           {reg.registrationType === 'duo' && (
                             <Badge variant="outline" className={`justify-center ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}>
                                P2: {reg.rider2CheckedIn ? 'Checked-in' : 'Pending'}
                            </Badge>
                           )}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex flex-col sm:flex-row items-end justify-end gap-2">
                             <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-green-700 border-green-200 bg-green-50 hover:bg-green-100 dark:text-green-200 dark:border-green-800 dark:bg-green-900 dark:hover:bg-green-800">
                                <Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Contact
                                </Link>
                             </Button>
                            {canEdit && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="w-full sm:w-auto" disabled={isDeleting === reg.id}>
                                            {isDeleting === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the registration for <span className="font-bold">{reg.fullName}</span>.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(reg.id)} className="bg-destructive hover:bg-destructive/90">
                                            Yes, delete registration
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    {searchTerm ? 'No approved riders match your search.' : 'No approved riders found.'}
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

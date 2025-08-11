
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, MessageCircle, Trash2, Send, Eye, MoreVertical, User as UserIcon, Edit } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteRegistration } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { EditRegistrationForm } from './edit-registration-form';


// Helper function to format WhatsApp links
const formatWhatsAppLink = (phone: string, message?: string) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
        cleanedPhone = `91${cleanedPhone}`;
    }
    const url = `https://wa.me/${cleanedPhone}`;
    if (message) {
        return `${url}?text=${encodeURIComponent(message)}`;
    }
    return url;
};

const getTicketMessage = (name: string, ticketUrl: string) => `Hi ${name}, your registration for the TeleFun Mobiles Freedom Ride is confirmed! You can view and download your digital ticket here: ${ticketUrl}`;

const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-1/4" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-9" /></TableCell>
        </TableRow>
    ))
);

export function RidersListTable() {
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );
  const [user, authLoading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

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
  
  const handleEdit = (reg: Registration) => {
    setSelectedRegistration(reg);
    setIsFormOpen(true);
  };
  
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
                Export as CSV
            </Button>
        </div>

        <EditRegistrationForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            registration={selectedRegistration}
            user={user}
        />

        {/* Mobile card view */}
        <div className="md:hidden space-y-4">
            {(loading || authLoading) ? (
                 [...Array(3)].map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                 ))
            ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                    <Card key={reg.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={reg.photoURL} alt={reg.fullName} />
                                        <AvatarFallback><UserIcon /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</p>
                                        <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'} className="capitalize mt-1">{reg.registrationType}</Badge>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Rider Actions</DialogTitle>
                                            <DialogDescription>{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</DialogDescription>
                                        </DialogHeader>
                                        {/* Content duplicated from desktop view for consistency */}
                                        <div className="space-y-4 py-4">
                                            <div className="p-3 border rounded-md bg-background space-y-2">
                                                <p className="font-semibold">{reg.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{reg.phoneNumber}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`justify-center ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P1: {reg.rider1CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                    <Badge variant="outline" className={`justify-center ${reg.rider1Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P1: {reg.rider1Finished ? 'Finished' : 'Pending'}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber, getTicketMessage(reg.fullName, `/ticket/${reg.id}`))} target="_blank"><Send /> Send</Link></Button>
                                                    <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                </div>
                                            </div>

                                            {reg.registrationType === 'duo' && reg.phoneNumber2 && (
                                                <div className="p-3 border rounded-md bg-background space-y-2">
                                                    <p className="font-semibold">{reg.fullName2}</p>
                                                    <p className="text-sm text-muted-foreground">{reg.phoneNumber2}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`justify-center ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P2: {reg.rider2CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                        <Badge variant="outline" className={`justify-center ${reg.rider2Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P2: {reg.rider2Finished ? 'Finished' : 'Pending'}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber2, getTicketMessage(reg.fullName2 || 'Rider', `/ticket/${reg.id}`))} target="_blank"><Send /> Send</Link></Button>
                                                        <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber2)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    {searchTerm ? 'No approved riders match your search.' : 'No approved riders found.'}
                </div>
            )}
        </div>
        
        {/* Desktop table view */}
        <div className="hidden md:block border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Rider(s)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {(loading || authLoading) ? (
                  <TableSkeleton />
            ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => {
                    const ticketUrl = `/ticket/${reg.id}`;
                    return (
                        <TableRow key={reg.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage src={reg.photoURL} alt={reg.fullName} />
                                    <AvatarFallback><UserIcon /></AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                                {reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}
                            </TableCell>
                            <TableCell>
                                <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'} className="capitalize">
                                    {reg.registrationType}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Rider Actions</DialogTitle>
                                            <DialogDescription>{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="p-3 border rounded-md bg-background space-y-2">
                                                <p className="font-semibold">{reg.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{reg.phoneNumber}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`justify-center ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P1: {reg.rider1CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                    <Badge variant="outline" className={`justify-center ${reg.rider1Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P1: {reg.rider1Finished ? 'Finished' : 'Pending'}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber, getTicketMessage(reg.fullName, ticketUrl))} target="_blank"><Send /> Send</Link></Button>
                                                    <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                </div>
                                            </div>

                                            {reg.registrationType === 'duo' && reg.phoneNumber2 && (
                                                <div className="p-3 border rounded-md bg-background space-y-2">
                                                    <p className="font-semibold">{reg.fullName2}</p>
                                                    <p className="text-sm text-muted-foreground">{reg.phoneNumber2}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`justify-center ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P2: {reg.rider2CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                        <Badge variant="outline" className={`justify-center ${reg.rider2Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P2: {reg.rider2Finished ? 'Finished' : 'Pending'}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber2, getTicketMessage(reg.fullName2 || 'Rider', ticketUrl))} target="_blank"><Send /> Send</Link></Button>
                                                        <Button asChild variant="outline" size="sm"><Link href={formatWhatsAppLink(reg.phoneNumber2)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                    </div>
                                                </div>
                                            )}

                                            <Separator />
                                            
                                            <div className="flex gap-2 justify-end">
                                                 <Button asChild variant="secondary" size="sm"><Link href={ticketUrl} target="_blank"><Eye /> View Ticket</Link></Button>
                                                {canEdit && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(reg)}><Edit className="mr-2 h-4 w-4"/>Edit Info</Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm" disabled={isDeleting === reg.id}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the registration for <span className="font-bold">{reg.fullName}</span>.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(reg.id)} className="bg-destructive hover:bg-destructive/90">Yes, delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    )
                })
            ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
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

    

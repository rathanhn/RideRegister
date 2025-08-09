
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
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, MessageCircle, Trash2, Send, ChevronDown, Eye } from 'lucide-react';
import type { Registration, UserRole } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteRegistration } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

// Helper function to format WhatsApp links
const formatWhatsAppLink = (phone: string, message?: string) => {
    // Remove non-digit characters and add country code if missing
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

const getTicketMessage = (name: string, ticketUrl: string) => `Hi ${name}, your registration for the TeleFun Mobiles Independence Day Ride is confirmed! You can view and download your digital ticket here: ${ticketUrl}`;

const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
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
  const [origin, setOrigin] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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
                Export as CSV
            </Button>
        </div>
        
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-2">
           {(loading || authLoading) ? (
                [...Array(3)].map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-5 w-3/4" /></CardContent></Card>
                ))
            ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => {
                    const ticketUrl = `${origin}/ticket/${reg.id}`;
                    return (
                        <Card key={reg.id}>
                            <div className="p-4 flex justify-between items-center" onClick={() => setExpandedRow(expandedRow === reg.id ? null : reg.id)}>
                                <span className="font-semibold text-left">{reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedRow === reg.id ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedRow === reg.id && (
                                <>
                                <Separator />
                                <div className="p-4 space-y-4">
                                    <div className="space-y-3">
                                        <p className="font-semibold">{reg.fullName}</p>
                                        <p className="text-sm text-muted-foreground">{reg.phoneNumber}</p>
                                        <Badge variant="outline" className={`mt-1 ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>{reg.rider1CheckedIn ? 'Checked-in' : 'Pending Check-in'}</Badge>
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"><Link href={formatWhatsAppLink(reg.phoneNumber, getTicketMessage(reg.fullName, ticketUrl))} target="_blank"><Send /> Send</Link></Button>
                                            <Button asChild size="sm" className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"><Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank"><MessageCircle /> Chat</Link></Button>
                                            <Button asChild size="sm" variant="outline" className="flex-1"><Link href={ticketUrl} target="_blank"><Eye /> View</Link></Button>
                                        </div>
                                    </div>
                                    
                                    {reg.registrationType === 'duo' && reg.fullName2 && (
                                        <>
                                        <Separator />
                                        <div className="space-y-3">
                                            <p className="font-semibold">{reg.fullName2}</p>
                                            <p className="text-sm text-muted-foreground">{reg.phoneNumber2}</p>
                                            <Badge variant="outline" className={`mt-1 ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>{reg.rider2CheckedIn ? 'Checked-in' : 'Pending Check-in'}</Badge>
                                            <div className="flex gap-2">
                                                <Button asChild size="sm" className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"><Link href={formatWhatsAppLink(reg.phoneNumber2 || '', getTicketMessage(reg.fullName2, ticketUrl))} target="_blank"><Send /> Send</Link></Button>
                                                <Button asChild size="sm" className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"><Link href={formatWhatsAppLink(reg.phoneNumber2 || '')} target="_blank"><MessageCircle /> Chat</Link></Button>
                                                 <Button asChild size="sm" variant="outline" className="flex-1"><Link href={ticketUrl} target="_blank"><Eye /> View</Link></Button>
                                            </div>
                                        </div>
                                        </>
                                    )}

                                    {canEdit && (
                                        <>
                                        <Separator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full" disabled={isDeleting === reg.id}><Trash2 className="mr-2 h-4 w-4" />Delete Registration</Button></AlertDialogTrigger>
                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the registration for <span className="font-bold">{reg.fullName}</span>.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(reg.id)} className="bg-destructive hover:bg-destructive/90">Yes, delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                        </AlertDialog>
                                        </>
                                    )}
                                </div>
                                </>
                            )}
                        </Card>
                    )
                })
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                   {searchTerm ? 'No approved riders match your search.' : 'No approved riders found.'}
                </div>
            )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Rider(s)</TableHead>
                <TableHead className="text-right">Expand</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {(loading || authLoading) ? (
                  <TableSkeleton />
            ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => {
                     const ticketUrl = `${origin}/ticket/${reg.id}`;
                     const isExpanded = expandedRow === reg.id;
                    return (
                        <React.Fragment key={reg.id}>
                            <TableRow onClick={() => setExpandedRow(isExpanded ? null : reg.id)} className="cursor-pointer">
                                <TableCell className="font-medium">
                                    {reg.fullName}{reg.registrationType === 'duo' && ` & ${reg.fullName2}`}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        <span className="sr-only">Expand</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            {isExpanded && (
                                <TableRow>
                                    <TableCell colSpan={2} className="p-0">
                                        <div className="p-4 bg-secondary/50 space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {/* Rider 1 Details */}
                                                <div className="p-3 border rounded-md bg-background space-y-2">
                                                    <p className="font-semibold">{reg.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{reg.phoneNumber}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`justify-center ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P1: {reg.rider1CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                        <Badge variant="outline" className={`justify-center ${reg.rider1Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P1: {reg.rider1Finished ? 'Finished' : 'Pending'}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <Button asChild variant="outline" size="sm" className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"><Link href={formatWhatsAppLink(reg.phoneNumber, getTicketMessage(reg.fullName, ticketUrl))} target="_blank"><Send /> Send Ticket</Link></Button>
                                                        <Button asChild variant="outline" size="sm" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"><Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                        <Button asChild variant="outline" size="sm"><Link href={ticketUrl} target="_blank"><Eye /> View Ticket</Link></Button>
                                                    </div>
                                                </div>
                                                {/* Rider 2 Details */}
                                                {reg.registrationType === 'duo' && reg.phoneNumber2 && (
                                                    <div className="p-3 border rounded-md bg-background space-y-2">
                                                        <p className="font-semibold">{reg.fullName2}</p>
                                                        <p className="text-sm text-muted-foreground">{reg.phoneNumber2}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`justify-center ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>P2: {reg.rider2CheckedIn ? 'Checked-in' : 'Pending'}</Badge>
                                                            <Badge variant="outline" className={`justify-center ${reg.rider2Finished ? 'bg-blue-100 text-blue-800' : ''}`}>P2: {reg.rider2Finished ? 'Finished' : 'Pending'}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <Button asChild variant="outline" size="sm" className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"><Link href={formatWhatsAppLink(reg.phoneNumber2, getTicketMessage(reg.fullName2 || 'Rider', ticketUrl))} target="_blank"><Send /> Send Ticket</Link></Button>
                                                            <Button asChild variant="outline" size="sm" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"><Link href={formatWhatsAppLink(reg.phoneNumber2)} target="_blank"><MessageCircle /> Message</Link></Button>
                                                            <Button asChild variant="outline" size="sm"><Link href={ticketUrl} target="_blank"><Eye /> View Ticket</Link></Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {canEdit && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full mt-2" disabled={isDeleting === reg.id}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the registration for <span className="font-bold">{reg.fullName}</span>.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(reg.id)} className="bg-destructive hover:bg-destructive/90">Yes, delete registration</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    )
                })
            ) : (
                  <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
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

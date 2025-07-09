
"use client";

import { useState, useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, MessageCircle } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';

// Helper function to format WhatsApp links
const formatWhatsAppLink = (phone: string) => {
    // Remove non-digit characters and add country code if missing
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
        cleanedPhone = `91${cleanedPhone}`;
    }
    return `https://wa.me/${cleanedPhone}`;
};

export function RidersListTable() {
  // Query for all registrations, we will filter locally
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );
  const [searchTerm, setSearchTerm] = useState('');

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


  if (loading) {
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
        <div className="flex justify-between items-center mb-4 gap-4">
            <Input 
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Button onClick={handleExport} disabled={filteredRegistrations.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Rider(s)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Check-in Status</TableHead>
                <TableHead className="text-right">Contact</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                        <div>{reg.fullName} ({reg.phoneNumber})</div>
                        {reg.registrationType === 'duo' && reg.fullName2 && <div className="text-xs text-muted-foreground">{reg.fullName2} ({reg.phoneNumber2})</div>}
                    </TableCell>
                    <TableCell>
                    <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'}>
                        {reg.registrationType}
                    </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={`justify-center ${reg.rider1CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>
                                P1: {reg.rider1CheckedIn ? 'Checked-in' : 'Pending'}
                            </Badge>
                           {reg.registrationType === 'duo' && (
                             <Badge variant="outline" className={`justify-center ${reg.rider2CheckedIn ? 'bg-green-100 text-green-800' : ''}`}>
                                P2: {reg.rider2CheckedIn ? 'Checked-in' : 'Pending'}
                            </Badge>
                           )}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                             <Button asChild variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 text-green-700">
                                <Link href={formatWhatsAppLink(reg.phoneNumber)} target="_blank">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    P1
                                </Link>
                             </Button>
                            {reg.registrationType === 'duo' && reg.phoneNumber2 && (
                                <Button asChild variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 text-green-700">
                                    <Link href={formatWhatsAppLink(reg.phoneNumber2)} target="_blank">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        P2
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
                ))
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

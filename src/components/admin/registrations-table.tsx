
"use client";

import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
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
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from '../ui/button';

export function RegistrationsTable() {
  const [value, loading, error] = useCollection(collection(db, 'registrations'));

  const registrations = value?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[] || [];

  const handleExport = () => {
    if (!registrations.length) return;

    const headers = [
      "ID",
      "Registration Type",
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
      ...registrations.map(reg => {
        // Escape commas in names by wrapping them in quotes
        const rider1Name = `"${reg.fullName}"`;
        const rider2Name = reg.fullName2 ? `"${reg.fullName2}"` : "N/A";

        const row = [
          reg.id,
          reg.registrationType,
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
        <div className="flex justify-end mb-4">
            <Button onClick={handleExport} disabled={registrations.length === 0}>
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
                <TableHead>Rider 2 Name</TableHead>
                <TableHead>Registered On</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {registrations.length > 0 ? (
                registrations.map((reg) => (
                <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.fullName}</TableCell>
                    <TableCell>
                    <Badge variant={reg.registrationType === 'duo' ? 'default' : 'secondary'}>
                        {reg.registrationType}
                    </Badge>
                    </TableCell>
                    <TableCell>{reg.phoneNumber}</TableCell>
                    <TableCell>{reg.fullName2 || 'N/A'}</TableCell>
                    <TableCell>
                    {reg.createdAt?.toDate().toLocaleDateString()}
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

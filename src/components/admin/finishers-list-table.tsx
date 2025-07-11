
"use client";

import { useState, useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { Loader2, AlertTriangle, Download, Flag } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

type FinishedParticipant = {
    id: string;
    registrationId: string;
    name: string;
    phone: string;
    type: 'Solo' | 'Duo (Rider 1)' | 'Duo (Rider 2)';
}

const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
        </TableRow>
    ))
);


export function FinishersListTable() {
  const [registrations, loading, error] = useCollection(
    query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))
  );
  const [searchTerm, setSearchTerm] = useState('');

  const finishedParticipants = useMemo(() => {
    if (!registrations) return [];
    
    const participants: FinishedParticipant[] = [];
    registrations.docs.forEach(doc => {
      const reg = { id: doc.id, ...doc.data() } as Registration;
      if (reg.status !== 'approved') return;

      if (reg.rider1Finished) {
          participants.push({
              id: `${reg.id}-1`,
              registrationId: reg.id,
              name: reg.fullName,
              phone: reg.phoneNumber,
              type: reg.registrationType === 'solo' ? 'Solo' : 'Duo (Rider 1)',
          });
      }
      if (reg.rider2Finished && reg.fullName2 && reg.phoneNumber2) {
           participants.push({
              id: `${reg.id}-2`,
              registrationId: reg.id,
              name: reg.fullName2,
              phone: reg.phoneNumber2,
              type: 'Duo (Rider 2)',
          });
      }
    });

    return participants;
  }, [registrations]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return finishedParticipants;
    return finishedParticipants.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );
  }, [finishedParticipants, searchTerm]);
  
  const handleExport = () => {
    if (!filteredParticipants.length) return;

    const headers = ["Participant ID", "Registration ID", "Name", "Phone", "Type"];
    const csvRows = [
      headers.join(','),
      ...filteredParticipants.map(p => {
        const row = [p.id, p.registrationId, `"${p.name}"`, p.phone, p.type];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'finishers_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4">
        <AlertTriangle />
        <p>Error loading data: {error.message}</p>
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
            <Button onClick={handleExport} disabled={filteredParticipants.length === 0} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
            </Button>
        </div>
        
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
           {loading ? (
                [...Array(3)].map((_, i) => (
                    <Card key={i}><CardContent className="p-4 space-y-4"><div className="flex justify-between items-start"><div className="space-y-1"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div><Skeleton className="h-6 w-20" /></div></CardContent></Card>
                ))
            ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                    <Card key={p.id}>
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-muted-foreground">{p.phone}</p>
                                <Badge variant="secondary" className="mt-1">{p.type}</Badge>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Flag className="mr-2 h-4 w-4" />Finished</Badge>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-10 text-muted-foreground">{searchTerm ? 'No finishers match your search.' : 'No riders have finished yet.'}</div>
            )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block border rounded-lg">
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
                <TableBody>
                {loading ? (<TableSkeleton />) : filteredParticipants.length > 0 ? (
                    filteredParticipants.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                        <TableCell className="text-right"><Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Flag className="mr-2 h-4 w-4" />Finished</Badge></TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">{searchTerm ? 'No finishers match your search.' : 'No riders have finished yet.'}</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}

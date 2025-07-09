
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
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Registration } from '@/lib/types';

export function RegistrationsTable() {
  const [value, loading, error] = useCollection(collection(db, 'registrations'));

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

  const registrations = value?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[] || [];

  return (
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
  );
}

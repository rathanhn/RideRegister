
"use client";

import { useState } from 'react';
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
import { Loader2, AlertTriangle, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import type { FormFieldDefinition } from '@/lib/types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FormManagement() {
  const [fields, loading, error] = useCollection(query(collection(db, 'formFields'), orderBy('order', 'asc')));
  
  const allFields = fields?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FormFieldDefinition[] || [];

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4">
        <AlertTriangle />
        <p>Error loading form fields: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Button>
                Add New Field
            </Button>
        </div>
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {allFields.length > 0 ? (
                allFields.map((field) => (
                <TableRow key={field.id}>
                    <TableCell>{field.order}</TableCell>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="capitalize">
                            {field.type}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {field.required ? (
                           <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                           <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                    No form fields configured. Add fields to build your registration form.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

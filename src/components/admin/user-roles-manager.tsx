
"use client";

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { AppUser, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole } from '@/app/actions';
import { useEffect } from 'react';

export function UserRolesManager() {
  const [loggedInUser, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Query for users who have a role that is NOT 'user'
  const usersQuery = useMemo(() => {
    return query(
      collection(db, 'users'), 
      where('role', 'in', ['superadmin', 'admin', 'viewer']), 
      orderBy('createdAt', 'desc')
    );
  }, []);

  const [users, usersLoading, usersError] = useCollection(usersQuery);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (loggedInUser) {
        const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
        if (userDoc.exists()) {
          setCurrentUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, [loggedInUser]);

  const allUsers = users?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[] || [];

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (!loggedInUser) return;
    setIsUpdating(targetUserId);

    const result = await updateUserRole({
      adminId: loggedInUser.uid,
      targetUserId,
      newRole,
    });

    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsUpdating(null);
  };

  if (authLoading || (!currentUserRole && !authLoading)) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (currentUserRole !== 'superadmin') {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 p-4 bg-secondary rounded-md">
        <ShieldAlert className="h-5 w-5" />
        <p>You do not have permission to manage user roles.</p>
      </div>
    );
  }

  if (usersLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (usersError) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4">
        <AlertTriangle />
        <p>Error loading users: {usersError.message}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead className="text-right">Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allUsers.length > 0 ? (
            allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'superadmin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'} className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isUpdating === user.id ? (
                     <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                  ) : (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                      disabled={user.id === loggedInUser?.uid} // Disable changing own role
                    >
                      <SelectTrigger className="w-[180px] ml-auto">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No users with administrative roles found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

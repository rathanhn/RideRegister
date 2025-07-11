
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
import { Skeleton } from '../ui/skeleton';

const TableSkeleton = () => (
    [...Array(3)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-9 w-32 ml-auto" /></TableCell>
        </TableRow>
    ))
);

export function UserRolesManager() {
  const [loggedInUser, authLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  
  // Query for users who have a role that is NOT 'user'
  const usersQuery = useMemo(() => {
    // This query now fetches users who have requested access or have an elevated role.
    return query(
      collection(db, 'users'), 
      where('role', 'in', ['superadmin', 'admin', 'viewer'])
    );
  }, []);

  const [users, usersLoading, usersError] = useCollection(usersQuery);

  useEffect(() => {
    const fetchUserRole = async () => {
      setIsRoleLoading(true);
      if (loggedInUser) {
        const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
        if (userDoc.exists()) {
          setCurrentUserRole(userDoc.data().role);
        }
      }
      setIsRoleLoading(false);
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

  const isLoading = authLoading || isRoleLoading || usersLoading;

  // Only superadmins and admins can view this component
  if (!isLoading && currentUserRole !== 'superadmin') {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 p-4 bg-secondary rounded-md">
        <ShieldAlert className="h-5 w-5" />
        <p>You do not have permission to manage user roles. Only Super Admins can.</p>
      </div>
    );
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
          {isLoading ? (
            <TableSkeleton />
          ) : allUsers.length > 0 ? (
            allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'superadmin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'} 
                    className="capitalize"
                  >
                    {user.role}
                    {user.accessRequest?.status === 'pending_review' && ' (Requested)'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isUpdating === user.id ? (
                     <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                  ) : (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                      disabled={user.id === loggedInUser?.uid || currentUserRole !== 'superadmin'}
                    >
                      <SelectTrigger className="w-[180px] ml-auto">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem 
                          value="superadmin"
                          disabled={currentUserRole !== 'superadmin'}
                        >
                          Super Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No users with administrative or pending roles found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

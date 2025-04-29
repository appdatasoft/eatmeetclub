
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

const UsersPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get all users from auth
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw userError;
      }
      
      // Get roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        throw rolesError;
      }
      
      // Map roles to users
      const roleMap = (rolesData || []).reduce((acc: Record<string, string>, item: any) => {
        acc[item.user_id] = item.role;
        return acc;
      }, {});
      
      const formattedUsers = userData.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: (roleMap[user.id] || 'user') as 'admin' | 'user',
        created_at: user.created_at
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  const handlePromote = (user: User) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };
  
  const confirmPromote = async () => {
    if (!selectedUser) return;
    
    setIsPromoting(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: selectedUser.id, role: 'admin' },
          { onConflict: 'user_id' }
        );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "User promoted",
        description: `${selectedUser.email} is now an admin`
      });
      
      setShowConfirm(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive"
      });
    } finally {
      setIsPromoting(false);
      setSelectedUser(null);
    }
  };
  
  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePromote(user)}
                          >
                            Make Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote User to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to make {selectedUser?.email} an admin? 
              This will give them full access to the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmPromote} 
              disabled={isPromoting}
            >
              {isPromoting ? "Promoting..." : "Yes, Make Admin"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;

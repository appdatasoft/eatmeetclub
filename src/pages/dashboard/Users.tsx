
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

const UsersPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Authentication required");
        }
        
        // Check admin status
        const { data: adminData, error: adminError } = await supabase.rpc(
          'is_admin',
          { user_id: sessionData.session.user.id }
        );
        
        if (adminError) throw adminError;
        
        if (!adminData) {
          setIsAdmin(false);
          throw new Error("Admin privileges required");
        }
        
        setIsAdmin(true);
        
        // Fetch users data
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
          throw userError;
        }

        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) {
          throw rolesError;
        }

        // Map roles to user IDs
        const roleMap: Record<string, string> = {};
        rolesData.forEach((role: any) => {
          roleMap[role.user_id] = role.role;
        });

        // Format user data
        const formattedUsers = userData.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          role: (roleMap[user.id] || 'user') as 'admin' | 'user',
          created_at: user.created_at
        }));
        
        setUsers(formattedUsers);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAndFetchData();
  }, [toast]);

  if (!isAdmin && !isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-10">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 text-center">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Users className="mr-2 h-6 w-6" /> Manage Users
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;

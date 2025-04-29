
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    restaurants: 0,
    paidEvents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
        
        // Fetch paid events count
        const { count: paidEventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'completed');
        
        // Fetch restaurants count
        const { count: restaurantsCount } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });
        
        setStats({
          users: userCount || 0,
          events: eventsCount || 0,
          restaurants: restaurantsCount || 0,
          paidEvents: paidEventsCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Users</CardTitle>
              <CardDescription>Total registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Events</CardTitle>
              <CardDescription>Total events created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <p className="text-3xl font-bold">{stats.events}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.paidEvents} paid events ({Math.round((stats.paidEvents / (stats.events || 1)) * 100)}%)
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Restaurants</CardTitle>
              <CardDescription>Total restaurants registered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.restaurants}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total revenue from event fees</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${(stats.paidEvents * 50).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

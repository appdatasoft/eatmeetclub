
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/fetch-client';

// Define a type for our stats
type AdminStats = {
  users: number;
  events: number;
  restaurants: number;
  paidEvents: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    events: 0,
    restaurants: 0,
    paidEvents: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use callback to avoid recreating the function on each render
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch prepopulated stats if available to improve initial load time
      try {
        const { data: fastStats } = await get<AdminStats>('/api/admin/stats.json', {
          cacheTime: 60000, // 1 minute cache
          staleTime: 30000, // Consider data stale after 30s
          background: true,  // Refresh data in the background if stale
        });
        
        if (fastStats) {
          console.log("Using cached stats data");
          setStats(fastStats);
          setIsLoading(false);
        }
      } catch (e) {
        // Silent fail - we'll continue with the direct database fetch below
        console.log("No cached stats available, using live data");
      }
      
      // Use Promise.all to fetch all stats in parallel
      const [userResult, eventsResult, paidEventsResult, restaurantsResult] = await Promise.all([
        // Fetch user count
        supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true }),
          
        // Fetch events count
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true }),
          
        // Fetch paid events count
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'completed'),
          
        // Fetch restaurants count
        supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
      ]);
      
      // Check for errors
      if (userResult.error) throw new Error(userResult.error.message);
      if (eventsResult.error) throw new Error(eventsResult.error.message);
      if (paidEventsResult.error) throw new Error(paidEventsResult.error.message);
      if (restaurantsResult.error) throw new Error(restaurantsResult.error.message);
      
      // Update the stats
      setStats({
        users: userResult.count || 0,
        events: eventsResult.count || 0,
        restaurants: restaurantsResult.count || 0,
        paidEvents: paidEventsResult.count || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || "Failed to load admin dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading dashboard data..." />
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

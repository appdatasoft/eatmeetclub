
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from "@/hooks/use-toast";
import QuickActions from '@/components/dashboard/QuickActions';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import EventsList from '@/components/dashboard/EventsList';
import RestaurantsList from '@/components/dashboard/RestaurantsList';
import { useAuth } from '@/hooks/useAuth';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  website: string | null;
  zipcode: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant_id: string;
  capacity: number;
  price: number;
  payment_status: string; 
  published: boolean;
  tickets_sold?: number;
  restaurant: {
    name: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Dashboard component rendering, auth state:", { user, isAdmin, authLoading });

  // Function to fetch restaurants
  const fetchRestaurants = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching restaurants for user:", user.id);
      
      let query = supabase
        .from('restaurants')
        .select('id, name, cuisine_type, city, state, address, phone, website, zipcode');
      
      // Only filter by user_id if not an admin
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
      
      console.log("Restaurants fetched:", data?.length);
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error fetching restaurants",
        description: "Could not load your restaurants",
        variant: "destructive"
      });
    }
  };
  
  // Function to fetch events
  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching events for user:", user.id);
      
      let query = supabase
        .from('events')
        .select('id, title, date, time, restaurant_id, capacity, price, payment_status, published, tickets_sold, restaurant:restaurants(name), user_id');
      
      // Only filter by user_id if not an admin
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      
      query = query.order('date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      console.log("Events fetched:", data?.length);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Only fetch data when we have a user and auth is not loading
    if (user && !authLoading) {
      console.log("Auth confirmed, fetching dashboard data");
      setIsLoading(true);
      Promise.all([fetchRestaurants(), fetchEvents()])
        .catch((error) => {
          console.error("Error loading dashboard data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!user && !authLoading) {
      // Redirect to login if no user and auth has finished loading
      console.log("No user found, redirecting to login");
      navigate('/login');
    }
  }, [user, authLoading, navigate, isAdmin]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActions />
        <UpcomingEvents events={events} isLoading={isLoading} />
      </div>
      
      <EventsList 
        events={events} 
        isLoading={isLoading} 
        onRefresh={fetchEvents} 
        isAdmin={isAdmin}
      />
      
      <RestaurantsList 
        restaurants={restaurants} 
        isLoading={isLoading} 
        onRestaurantUpdate={fetchRestaurants} 
      />
    </DashboardLayout>
  );
};

export default Dashboard;

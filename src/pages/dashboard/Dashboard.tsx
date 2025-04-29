
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from "@/hooks/use-toast";
import QuickActions from '@/components/dashboard/QuickActions';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import EventsList from '@/components/dashboard/EventsList';
import RestaurantsList from '@/components/dashboard/RestaurantsList';

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
  restaurant: {
    name: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch restaurants
  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, city, state, address, phone, website, zipcode')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
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
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, restaurant_id, capacity, price, payment_status, restaurant:restaurants(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
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
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        // Fetch user's restaurants and events
        await Promise.all([fetchRestaurants(), fetchEvents()]);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handlePublishEvent = async (eventId: string, paymentStatus: string) => {
    if (paymentStatus !== 'completed') {
      toast({
        title: "Payment Required",
        description: "You need to complete the payment before publishing this event",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send the event to be published
    toast({
      title: "Event Published",
      description: "Your event has been published successfully"
    });
  };

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
        onPublishEvent={handlePublishEvent} 
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

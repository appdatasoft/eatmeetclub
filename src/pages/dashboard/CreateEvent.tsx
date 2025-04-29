
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import EventForm from '@/components/events/EventForm';

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  // Extract restaurantId from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const restaurantId = params.get('restaurantId');
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        // Fetch user's restaurants
        fetchRestaurants();
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch restaurants. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEventSubmit = async (eventDetails: any) => {
    setIsLoading(true);
    
    try {
      // Store event details in localStorage for use after payment
      localStorage.setItem('eventDetails', JSON.stringify(eventDetails));
      
      // Get session for the API call
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Create a payment session with Stripe
      const { data: responseData, error } = await supabase.functions.invoke('create-event-payment', {
        body: { eventDetails },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error || !responseData?.url) {
        throw new Error(error?.message || "Failed to create payment session");
      }
      
      // Redirect to Stripe checkout
      window.location.href = responseData.url;
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <Card className="p-6">
        <EventForm
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurantId}
          setSelectedRestaurantId={setSelectedRestaurantId}
          onSubmit={handleEventSubmit}
          isLoading={isLoading}
          onAddRestaurant={() => navigate('/dashboard/add-restaurant')}
        />
      </Card>
    </DashboardLayout>
  );
};

export default CreateEvent;

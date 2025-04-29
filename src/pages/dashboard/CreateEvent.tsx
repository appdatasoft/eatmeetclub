
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
  const [eventFee, setEventFee] = useState<number>(50);

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
        fetchEventFee();
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

  const fetchEventFee = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'EVENT_CREATION_FEE')
        .single();
      
      if (error) throw error;
      
      setEventFee(parseFloat(data.value) || 50);
    } catch (error) {
      console.error('Error fetching event fee:', error);
    }
  };

  const handleEventSubmit = async (eventDetails: any) => {
    setIsLoading(true);
    
    try {
      // Get session for the API call
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      console.log("Creating payment session for event:", eventDetails);
      
      // Create a Stripe checkout session
      const response = await supabase.functions.invoke('create-event-payment', {
        body: { eventDetails },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.error || !response.data?.url) {
        console.error("Error response:", response);
        throw new Error(response.error?.message || "Failed to create payment session");
      }
      
      // Store event details in localStorage to be accessed after payment
      localStorage.setItem('eventDetails', JSON.stringify(eventDetails));
      
      console.log("Payment session created, redirecting to:", response.data.url);
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating payment session:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <Card className="p-6">
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">
            Creating an event requires a publication fee of ${eventFee.toFixed(2)}. You will be redirected to a secure payment page after submitting this form.
          </p>
        </div>

        <EventForm
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurantId}
          setSelectedRestaurantId={setSelectedRestaurantId}
          onSubmit={handleEventSubmit}
          isLoading={isLoading}
          onAddRestaurant={() => navigate('/dashboard/add-restaurant')}
          eventFee={eventFee}
        />
      </Card>
    </DashboardLayout>
  );
};

export default CreateEvent;

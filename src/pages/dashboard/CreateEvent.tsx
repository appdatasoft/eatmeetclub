
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import EventForm from '@/components/events/EventForm';
import PaymentForm from '@/components/payment/PaymentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Fixed admin fee for creating an event
const EVENT_CREATION_FEE = 50;

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentEventDetails, setCurrentEventDetails] = useState<any>(null);

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

  const handleEventSubmit = (eventDetails: any) => {
    // Store event details and show payment form
    setCurrentEventDetails(eventDetails);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsLoading(true);
    
    try {
      // Get session for the API call
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Store the event in the database with verified payment
      const { data: eventData, error } = await supabase
        .from('events')
        .insert({
          ...currentEventDetails,
          user_id: data.session?.user.id,
          payment_status: 'completed',
          payment_id: paymentDetails.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Close the payment dialog
      setShowPaymentDialog(false);
      
      // Show success message
      toast({
        title: "Success!",
        description: "Your event has been created successfully."
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setIsLoading(false);
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment for Event Creation</DialogTitle>
          </DialogHeader>
          <PaymentForm 
            amount={EVENT_CREATION_FEE} 
            onSuccess={handlePaymentSuccess} 
            onCancel={handlePaymentCancel} 
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateEvent;


import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import EventForm from '@/components/events/EventForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/common/Button';

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

  const handleEventSubmit = async (eventDetails: any) => {
    setCurrentEventDetails(eventDetails);
    setIsLoading(true);
    
    try {
      // Get session for the API call
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      // Create a Stripe checkout session
      const { data: responseData, error } = await supabase.functions.invoke('create-event-payment', {
        body: { eventDetails },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error || !responseData?.url) {
        throw new Error(error?.message || "Failed to create payment session");
      }
      
      // Store event details in localStorage to be accessed after payment
      localStorage.setItem('eventDetails', JSON.stringify(eventDetails));
      
      // Redirect to Stripe checkout
      window.location.href = responseData.url;
    } catch (error) {
      console.error('Error creating payment session:', error);
      setShowPaymentDialog(false);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelPayment = () => {
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
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">You will be redirected to Stripe to complete your payment of ${EVENT_CREATION_FEE}.00</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button 
              isLoading={isLoading} 
              disabled={isLoading}
              className="flex-1"
            >
              Processing...
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelPayment}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateEvent;

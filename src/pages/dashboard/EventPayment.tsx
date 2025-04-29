
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/common/Button';

const EventPayment = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [eventFee, setEventFee] = useState<number>(50);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch event fee from app_config
        const { data: configData, error: configError } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'EVENT_CREATION_FEE')
          .single();
        
        if (!configError && configData) {
          setEventFee(parseFloat(configData.value) || 50);
        }
        
        // Fetch event details
        await fetchEventDetails();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchEventDetails = async () => {
    try {
      // Get session to check authentication
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
        return;
      }
      
      // Fetch event details
      const { data: eventData, error } = await supabase
        .from('events')
        .select('*, restaurant:restaurants(name)')
        .eq('id', eventId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Check if event belongs to current user
      if (eventData.user_id !== data.session.user.id) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to access this event",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
      // If payment already completed, redirect to dashboard
      if (eventData.payment_status === 'completed') {
        toast({
          title: "Already Paid",
          description: "Payment for this event has already been completed",
        });
        navigate('/dashboard');
        return;
      }
      
      setEventDetails(eventData);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch event details. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    
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
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Event Payment</CardTitle>
            <CardDescription>
              Pay the ${eventFee.toFixed(2)} fee to publish your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventDetails && (
              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-lg">{eventDetails.title}</h3>
                  <p className="text-gray-500">at {eventDetails.restaurant?.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Date:</p>
                    <p>{new Date(eventDetails.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Time:</p>
                    <p>{eventDetails.time}</p>
                  </div>
                  <div>
                    <p className="font-medium">Capacity:</p>
                    <p>{eventDetails.capacity} people</p>
                  </div>
                  <div>
                    <p className="font-medium">Ticket Price:</p>
                    <p>${eventDetails.price.toFixed(2)} per person</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Event Creation Fee:</span>
                    <span>${eventFee.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800 text-sm">You will be redirected to Stripe to complete your payment.</p>
                </div>
              </div>
            )}
            
            <div className="pt-4 flex space-x-2">
              <Button
                onClick={handlePayment}
                isLoading={isProcessingPayment}
                className="flex-1"
              >
                Pay ${eventFee.toFixed(2)} Now
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventPayment;

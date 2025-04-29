
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PaymentForm from '@/components/payment/PaymentForm';

// Fixed admin fee for creating an event
const EVENT_CREATION_FEE = 50;

const EventPayment = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<any>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, navigate, toast]);

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsLoading(true);
    
    try {
      // Update the event payment status in the database
      const { error } = await supabase
        .from('events')
        .update({
          payment_status: 'completed',
          payment_id: paymentDetails.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Payment Successful",
        description: "Your event payment has been completed successfully."
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancel = () => {
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
              Pay the $50 fee to publish your event
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
                    <span>${EVENT_CREATION_FEE.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <PaymentForm 
              amount={EVENT_CREATION_FEE} 
              onSuccess={handlePaymentSuccess} 
              onCancel={handlePaymentCancel} 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventPayment;

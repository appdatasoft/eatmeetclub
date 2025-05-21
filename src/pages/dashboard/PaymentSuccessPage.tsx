
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { CheckCircle, Mail } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [eventFee, setEventFee] = useState<number>(50);

  useEffect(() => {
    const fetchEventFee = async () => {
      try {
        // Get event fee from app_config instead of using RPC
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'EVENT_CREATION_FEE')
          .single();
        
        if (!error && data) {
          setEventFee(parseFloat(data.value) || 50);
        }
      } catch (error) {
        console.error('Error fetching event fee:', error);
      }
    };

    fetchEventFee();

    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          toast({
            title: "Error",
            description: "Payment session ID not found",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        console.log("Verifying payment with session ID:", sessionId);
        
        // Get event details from local storage
        const storedEventDetails = localStorage.getItem('eventDetails');
        if (!storedEventDetails) {
          toast({
            title: "Error", 
            description: "Event details not found",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }

        const eventDetails = JSON.parse(storedEventDetails);
        
        // Verify the payment and save the event
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        
        if (!token) {
          throw new Error("Not authenticated");
        }
        
        console.log("Invoking verify-event-payment function");
        const { data: responseData, error } = await supabase.functions.invoke('verify-event-payment', {
          body: { sessionId, eventDetails },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Verification response:", responseData);

        if (error || !responseData?.success) {
          throw new Error(error?.message || responseData?.error || "Failed to verify payment");
        }

        setEventDetails(responseData.event);
        toast({
          title: "Success!",
          description: "Your event has been created successfully."
        });
        
        // Clear the stored event details
        localStorage.removeItem('eventDetails');
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Error",
          description: "Failed to verify payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [location, navigate, toast]);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-green-100">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl font-bold">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment of ${eventFee.toFixed(2)} has been processed and your event has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerifying ? (
              <p className="text-center text-sm">Verifying payment...</p>
            ) : eventDetails ? (
              <div className="space-y-2">
                <h3 className="font-medium">Event Details:</h3>
                <p className="text-sm"><span className="font-medium">Title:</span> {eventDetails.title}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {new Date(eventDetails.date).toLocaleDateString()}</p>
              </div>
            ) : null}
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md my-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                <p className="text-sm text-gray-600">
                  We've sent you an email with your invoice and receipt details. Please check your inbox!
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccessPage;

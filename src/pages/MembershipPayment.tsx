
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaymentForm from "@/components/payment/PaymentForm";
import { Button } from "@/components/common/Button";

const MembershipPayment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [membershipFee, setMembershipFee] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMembershipFee = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'MEMBERSHIP_FEE')
          .single();
        
        if (error) {
          console.error('Error fetching membership fee:', error);
        } else if (data) {
          setMembershipFee(Number(data.value));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);
    };

    fetchMembershipFee();
    getUser();
  }, []);

  const handlePaymentSuccess = (details: any) => {
    toast({
      title: "Membership activated!",
      description: "Your membership has been successfully activated.",
    });
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-16 px-4">
          <div className="container-custom">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-center">Sign In Required</h1>
              <p className="text-gray-600 mb-6 text-center">
                Please sign in or create an account to proceed with your membership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/login" variant="primary" className="justify-center">
                  Log In
                </Button>
                <Button href="/signup" variant="outline" className="justify-center">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-brand-500 text-white">
                <h1 className="text-2xl font-bold">Monthly Membership</h1>
                <p className="mt-1 text-white/90">Unlock premium features and exclusive events</p>
              </div>
              
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">Membership Benefits</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Early access to exclusive events</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Discounted event tickets</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Member-only community access</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Monthly newsletter with insider tips</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between mb-6">
                    <span className="text-gray-600">Monthly membership fee</span>
                    <span className="font-medium">${membershipFee.toFixed(2)}</span>
                  </div>
                  
                  <PaymentForm 
                    amount={membershipFee} 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={handleCancel} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPayment;

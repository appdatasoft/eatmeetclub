
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaymentForm from "@/components/payment/PaymentForm";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const membershipSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

const MembershipPayment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [membershipFee, setMembershipFee] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState<MembershipFormValues | null>(null);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchMembershipFee = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'MEMBERSHIP_FEE')
          .single();
        
        if (!error && data) {
          setMembershipFee(Number(data.value));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipFee();
  }, []);

  const onSubmit = (values: MembershipFormValues) => {
    setMembershipDetails(values);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!membershipDetails) return;
    
    try {
      setIsLoading(true);
      
      // Send user details and payment ID to the membership verification function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: paymentDetails.id,
            email: membershipDetails.email,
            name: membershipDetails.name,
            phone: membershipDetails.phone,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Welcome to Eat Meet Club!",
          description: "Your membership has been activated. Please check your email to set your password.",
        });
        navigate("/login");
      } else {
        throw new Error(data.message || "Failed to activate membership");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem activating your membership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
    } else {
      navigate("/");
    }
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-brand-500 text-white">
                <h1 className="text-2xl font-bold">Become a Member</h1>
                <p className="mt-1 text-white/90">Join our exclusive community for just ${membershipFee.toFixed(2)}/month</p>
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
                  {!showPaymentForm ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number (optional)</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between mt-6">
                          <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Continue to Payment
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Membership Details</h3>
                        <p className="text-sm text-gray-600">Name: {membershipDetails?.name}</p>
                        <p className="text-sm text-gray-600">Email: {membershipDetails?.email}</p>
                        {membershipDetails?.phone && (
                          <p className="text-sm text-gray-600">Phone: {membershipDetails.phone}</p>
                        )}
                      </div>
                      <PaymentForm 
                        amount={membershipFee} 
                        onSuccess={handlePaymentSuccess} 
                        onCancel={handleCancel} 
                      />
                    </>
                  )}
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

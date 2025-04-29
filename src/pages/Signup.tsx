
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  phoneNumber: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userDetails, setUserDetails] = useState<SignupFormValues | null>(null);
  const [membershipFee, setMembershipFee] = useState(25);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      phoneNumber: "",
    }
  });

  const formatCardNumber = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const formatExpiryDate = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setCardExpiry(formattedValue);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US phone numbers
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    form.setValue("phoneNumber", formattedValue);
  };

  const onSubmit = (values: SignupFormValues) => {
    setUserDetails(values);
    setShowPaymentForm(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;
    
    setIsLoading(true);

    try {
      // Mock payment processing - in production this would call the Stripe API
      // Generate a mock payment ID
      const mockPaymentId = `payment_${Date.now()}`;
      
      // Call the Supabase Edge Function to verify membership payment
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: mockPaymentId,
            email: userDetails.email,
            name: userDetails.email.split('@')[0], // Just using part of email as name for demo
            phone: userDetails.phoneNumber,
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
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem activating your membership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowPaymentForm(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="max-w-md w-full">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Become a Member</CardTitle>
              <CardDescription>Join Eat Meet Club and start social dining</CardDescription>
            </CardHeader>
            
            <CardContent>
              {!showPaymentForm ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="youremail@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 6 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(123) 456-7890"
                              {...field}
                              onChange={handlePhoneNumberChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Continue
                    </Button>

                    <div className="text-center text-sm">
                      <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Membership Details</h3>
                    <p className="text-sm text-gray-600">Email: {userDetails?.email}</p>
                    {userDetails?.phoneNumber && (
                      <p className="text-sm text-gray-600">Phone: {userDetails.phoneNumber}</p>
                    )}
                  </div>
                  
                  <form className="space-y-4" onSubmit={handlePayment}>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                      <p className="text-amber-800 text-sm">
                        You will be charged ${membershipFee.toFixed(2)} for your membership.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        className="mt-1"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryDateChange}
                          required
                          placeholder="MM/YY"
                          className="mt-1"
                          maxLength={5}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          required
                          placeholder="123"
                          className="mt-1"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleBack}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        className="flex-1"
                      >
                        Pay ${membershipFee.toFixed(2)}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;

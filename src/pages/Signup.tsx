
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Label } from "@/components/ui/label";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    setPhoneNumber(formattedValue);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Check your email for a confirmation link.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Become a Member</h1>
            <p className="mt-2 text-gray-600">
              Join Eat Meet Club and start social dining
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="youremail@example.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                  placeholder="(123) 456-7890"
                  className="mt-1"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </Label>
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
                    <div>
                      <Label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </Label>
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
                    
                    <div>
                      <Label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                        CVC
                      </Label>
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
                </div>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Sign Up
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
        </div>
      </div>
    </>
  );
};

export default Signup;

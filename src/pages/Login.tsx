
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // If there's a successful payment, verify it if we have a session ID
    if (isSuccess && sessionId) {
      verifyPayment(sessionId);
    } else if (isSuccess) {
      toast({
        title: "Membership activated!",
        description: "You can now log in to access your membership.",
      });
    }
  }, [isSuccess, sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      // Get session details to extract customer info
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: sessionId,
            isSubscription: true,
            // We're sending email and name here, but in a real implementation
            // these would come from the Stripe session metadata
            // This is just to make the demo work
            email: "member@example.com", 
            name: "New Member",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Membership activated!",
          description: "Your account has been created and a welcome email has been sent. Please check your inbox.",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
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
          description: "You are now logged in.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">
              Log in to your Eat Meet Club account
            </p>
          </div>
          
          {isSuccess && (
            <Alert className="border-green-100 bg-green-50 text-green-800 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your membership has been activated successfully! You can now log in to access your account.
              </AlertDescription>
            </Alert>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Log In
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/become-member" className="font-medium text-brand-500 hover:text-brand-600">
                  Become a member
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

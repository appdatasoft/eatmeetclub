
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if we have a redirect path from state
    const state = location.state as { from?: string };
    const fromPath = state?.from;
    
    if (fromPath) {
      setRedirectUrl(fromPath);
    } else {
      // Check for pending ticket purchase stored in localStorage
      const pendingPurchase = localStorage.getItem('pendingTicketPurchase');
      if (pendingPurchase) {
        try {
          const { redirectPath } = JSON.parse(pendingPurchase);
          if (redirectPath) {
            setRedirectUrl(redirectPath);
          }
        } catch (e) {
          console.error("Error parsing pending purchase:", e);
        }
      } else {
        // Check general redirect after login
        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          setRedirectUrl(redirect);
        }
      }
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("Login successful:", data);
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });

      // Handle redirects after login
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid login credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, don't show the login form
  if (user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <Link 
            to="/signup" 
            className="font-medium text-primary hover:underline"
            state={{ from: redirectUrl }}
          >
            Sign up
          </Link>
        </div>
        
        {!user && (
          <div className="mt-4 text-center">
            <Link 
              to="/become-member" 
              className="font-medium text-brand-600 hover:underline text-sm"
            >
              Become a Member
            </Link>
          </div>
        )}
        
        {redirectUrl && redirectUrl.includes('/event/') && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              Login to purchase tickets for this event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;


import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { user, handleLogin, isLoading } = useAuth();
  
  // Check for various redirect and status parameters
  const signupSuccess = searchParams.get('signup') === 'success';
  const emailVerified = searchParams.get('verified') === 'true';
  const redirectParam = searchParams.get('redirect');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      console.log("User already logged in, redirecting to dashboard or saved redirect");
      if (redirectParam === 'become-member') {
        navigate('/become-member');
      } else {
        const savedRedirect = redirectUrl || '/dashboard';
        navigate(savedRedirect);
      }
    }
  }, [user, navigate, isLoading, redirectUrl, redirectParam]);

  useEffect(() => {
    // Check if we have a redirect path from state or params
    const state = location.state as { from?: string };
    const fromPath = state?.from;
    
    if (redirectParam) {
      setRedirectUrl(`/${redirectParam}`);
    } else if (fromPath) {
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
    
    // Set stored email from signup flow if available
    const storedEmail = localStorage.getItem('loginEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      localStorage.removeItem('loginEmail');
    }
  }, [location, redirectParam]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await handleLogin(email, password);

      if (!result.success) {
        throw result.error;
      }

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });

      // Allow the auth state to update before attempting navigation
      setTimeout(() => {
        // Handle redirects after login
        if (redirectParam === 'become-member') {
          navigate('/become-member');
        } else if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate("/dashboard");
        }
      }, 100);
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

  // If already logged in and still loading, show a spinner
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Verifying your credentials...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If already logged in, don't show the login form
  if (user) {
    return <MainLayout><div className="min-h-[70vh]"></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="flex min-h-[70vh] py-12">
        <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {signupSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Registration successful! Please check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {emailVerified && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Email verified successfully! You can now log in.
              </AlertDescription>
            </Alert>
          )}

          {redirectParam === 'become-member' && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                Please log in or sign up to continue with your membership registration.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
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
          
          <div className="mt-4 text-center">
            <Link 
              to="/become-member" 
              className="font-medium text-brand-600 hover:underline text-sm"
            >
              Become a Member
            </Link>
          </div>
          
          {redirectUrl && redirectUrl.includes('/event/') && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                Login to purchase tickets for this event.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;

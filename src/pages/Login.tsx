
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/common/Button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle the success redirect from payment
  useEffect(() => {
    if (success && sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your membership has been activated.",
      });
    }
  }, [success, sessionId, toast]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "You are now signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "There was a problem signing you in",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {success && sessionId && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-800 font-medium">
                Membership payment successful!
              </AlertDescription>
            </div>
            <div className="mt-2 ml-6">
              <div className="flex items-start mt-2">
                <Mail className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                <p className="text-sm text-gray-600">
                  We've sent you an email with your invoice and account details. Please check your inbox!
                </p>
              </div>
            </div>
          </Alert>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold text-brand-500">Eat<span className="text-teal-500">Meet</span>Club</span>
            </Link>
            <h1 className="text-2xl font-bold mt-4">Log in to your account</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Log in
              </Button>

              <div className="text-center text-sm mt-4">
                <Link to="/reset-password" className="text-brand-500 hover:text-brand-600">
                  Forgot your password?
                </Link>
              </div>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <Link to="/become-member" className="text-brand-500 hover:text-brand-600 font-medium">
                Join as a member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

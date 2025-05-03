
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from query params - can be in either token or access_token parameter
  const token = searchParams.get('token') || searchParams.get('access_token');
  
  // Get email from query params if available (for the email link flow)
  const email = searchParams.get('email');

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      // When there's no token but there is an email, it's likely coming from the welcome email
      // where the user needs to set their password through a password recovery flow
      if (email) {
        console.log("Email provided without token, initiating password recovery:", email);
        handlePasswordRecovery(email);
      } else {
        setError("Invalid or missing reset token. Please use the link from your email.");
        toast({
          title: "Missing token",
          description: "Please use the link from the email to set your password.",
          variant: "destructive",
        });
      }
    } else {
      console.log("Password reset token found:", token.substring(0, 10) + "...");
    }
  }, [token, toast, email]);

  // Handle the case where user comes with email only and no token
  const handlePasswordRecovery = async (userEmail: string) => {
    try {
      // Send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for a link to set your password."
      });
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      setError(error.message || "Failed to send password reset email");
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        throw new Error("Invalid or missing token");
      }

      console.log("Attempting to update password with token");

      // Update user's password WITH the token for authentication
      const { error } = await supabase.auth.updateUser(
        { password: values.password },
        { accessToken: token } // Pass the token for authentication
      );

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      toast({
        title: "Password set successfully!",
        description: "You can now log in with your new password.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password setup error:", error);
      setError(error.message || "Failed to set password. Please try again.");
      toast({
        title: "Error",
        description: error.message || "There was a problem setting your password.",
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
        <div className="max-w-md w-full">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Set Your Password</CardTitle>
              <CardDescription>
                Complete your membership by setting a password for your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Password Set Successfully!</h2>
                  <p className="text-gray-600 mb-4">
                    Your password has been set successfully. You can now log in to your account.
                  </p>
                  <Button onClick={() => navigate("/login")}>
                    Go to Login
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your new password" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Setting Password..." : "Set Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SetPassword;

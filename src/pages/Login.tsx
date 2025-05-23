
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { LoginForm } from '@/components/auth/LoginForm';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { useConnectionCheck } from '@/components/auth/ConnectionCheck';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const { connectionChecking, connectionOk } = useConnectionCheck();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      await signIn(email, password);
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Check if it's a 400 error specifically
      if (error?.status === 400 || error?.message?.includes("400")) {
        toast({
          title: "Login failed",
          description: "Please check your email and password and try again",
          variant: "destructive",
        });
      } else {
        // Let the AuthContext handle other error messages
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <AuthRedirect>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="w-full max-w-md">
            <LoginForm 
              connectionOk={connectionOk}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </AuthRedirect>
    </MainLayout>
  );
};

export default Login;

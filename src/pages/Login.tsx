
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { LoginForm } from '@/components/auth/LoginForm';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { useConnectionCheck } from '@/components/auth/ConnectionCheck';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { handleLogin } = useAuth();
  const { connectionChecking, connectionOk } = useConnectionCheck();

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      const { success, error } = await handleLogin(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        console.error("Login failed:", error);
        toast({
          title: "Login failed",
          description: error?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
            />
          </div>
        </div>
      </AuthRedirect>
    </MainLayout>
  );
};

export default Login;

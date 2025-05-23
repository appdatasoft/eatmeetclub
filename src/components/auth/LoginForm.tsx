
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  connectionOk: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ connectionOk, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setInternalLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      await onSubmit(email, password);
    } catch (error: any) {
      console.error("Login form error:", error);
      // Error handling is done in the AuthContext, no need to show toast here
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        {!connectionOk && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 mb-4">
            <p className="text-sm">Connection issue detected. You may experience delays.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || internalLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || internalLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || internalLoading}
          >
            {loading || internalLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <p>Don't have an account? <a href="/register" className="text-primary hover:underline">Sign up</a></p>
          <p className="mt-2">
            <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

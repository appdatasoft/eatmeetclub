
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="font-bold text-xl text-blue-800">Eat Meet Club</div>
          <div className="space-x-2">
            {session ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
            Welcome to Eat Meet Club
          </h1>
          <p className="text-xl text-gray-700 mb-10">
            Connect with food lovers, discover new restaurants, and enjoy meals together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate(session ? '/dashboard' : '/register')}>
              {session ? 'Go to Dashboard' : 'Join Now'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/about')}>
              Learn More
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

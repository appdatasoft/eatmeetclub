
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 text-red-500">
        <AlertCircle size={50} className="mx-auto" />
      </div>
      <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl font-medium mb-2">Page not found</p>
      <p className="text-gray-600 max-w-md mb-8">
        The page "{location.pathname}" you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => navigate('/')}>
          Return to home
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

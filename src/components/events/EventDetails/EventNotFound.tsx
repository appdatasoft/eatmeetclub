
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EventNotFoundProps {
  error?: string | null;
}

const EventNotFound: React.FC<EventNotFoundProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="container-custom py-12 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        
        {error ? (
          <p className="text-red-500 mb-6">{error}</p>
        ) : (
          <p className="text-gray-600 mb-6">
            The event you're looking for may have been removed or doesn't exist.
          </p>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/events")}>
            Browse Events
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventNotFound;

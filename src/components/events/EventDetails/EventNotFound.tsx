
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface EventNotFoundProps {
  error?: string | null;
}

const EventNotFound: React.FC<EventNotFoundProps> = ({ error }) => {
  const navigate = useNavigate();

  // Get a user-friendly error message
  const getUserFriendlyError = (error?: string | null) => {
    if (!error) return null;
    
    if (error.includes("not found") || error.includes("Invalid event ID")) {
      return "The event you're looking for may have been removed or doesn't exist.";
    }
    
    if (error.includes("connect")) {
      return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    }
    
    if (error.includes("timeout")) {
      return "The request timed out. Please try again later.";
    }
    
    // Return a generic message for other errors
    return "There was a problem loading this event.";
  };

  const friendlyError = getUserFriendlyError(error);

  return (
    <div className="container-custom py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-red-500">
          <AlertCircle size={50} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          {friendlyError || "The event you're looking for may have been removed or doesn't exist."}
        </p>
        
        {error && error !== "Event not found" && error !== "null" && !friendlyError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-sm text-red-800">
            <strong>Error details:</strong> {error}
          </div>
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

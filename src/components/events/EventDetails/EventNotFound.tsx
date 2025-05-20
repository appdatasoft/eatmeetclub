
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { getUserFriendlyEventError } from "@/hooks/eventDetails/errorHandler";

interface EventNotFoundProps {
  error?: string | null;
}

const EventNotFound: React.FC<EventNotFoundProps> = ({ error }) => {
  const navigate = useNavigate();
  const friendlyError = getUserFriendlyEventError(error);

  return (
    <div className="container-custom py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-red-500">
          <AlertCircle size={50} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          {friendlyError}
        </p>
        
        {error && error !== "Event not found" && error !== "null" && !friendlyError.includes(error) && (
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


import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EventAccessControlProps {
  isPublished: boolean;
}

const EventAccessControl: React.FC<EventAccessControlProps> = ({ isPublished }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container-custom py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Event Not Available</h1>
      <p className="mb-6">
        {!isPublished 
          ? "This event is not currently published." 
          : "You don't have access to this event."}
      </p>
      <Button 
        variant="default"
        onClick={() => navigate('/events')}
      >
        Back to Events
      </Button>
    </div>
  );
};

export default EventAccessControl;

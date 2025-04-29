
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EventAccessControlProps {
  isPublished: boolean;
}

const EventAccessControl: React.FC<EventAccessControlProps> = ({ isPublished }) => {
  const navigate = useNavigate();
  
  if (!isPublished) {
    return (
      <div className="container-custom py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Available</h1>
        <p className="mb-6">This event is not currently published.</p>
        <Button 
          variant="default"
          onClick={() => navigate('/events')}
        >
          Back to Events
        </Button>
      </div>
    );
  }
  
  return null;
};

export default EventAccessControl;

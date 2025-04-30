
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UnpublishedEventNotice = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
      <div className="mb-4 text-amber-600 font-medium">⚠️ This event is not published</div>
      <p className="text-gray-600 mb-4">
        This event is currently in draft mode and is only visible to you and admins.
        Publish your event to make it available to the public.
      </p>
      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default UnpublishedEventNotice;

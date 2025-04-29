
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a placeholder for the event creation form.</p>
            <div className="mt-4">
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;

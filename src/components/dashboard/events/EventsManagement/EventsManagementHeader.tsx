
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EventsManagementHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Events Management</CardTitle>
        <CardDescription>Manage your events</CardDescription>
      </div>
      <Button onClick={() => navigate("/dashboard/create-event")}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Event
      </Button>
    </div>
  );
};

export default EventsManagementHeader;

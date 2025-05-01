
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">You haven't created any events yet</p>
      <Button onClick={() => navigate("/dashboard/create-event")}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Your First Event
      </Button>
    </div>
  );
};

export default EmptyState;

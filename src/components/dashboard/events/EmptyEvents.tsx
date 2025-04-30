
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyEvents = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-6">
      <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
      <Button onClick={() => navigate('/dashboard/create-event')}>
        Create Your First Event
      </Button>
    </div>
  );
};

export default EmptyEvents;

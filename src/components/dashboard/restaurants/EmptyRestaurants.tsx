
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyRestaurants = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-6">
      <p className="text-gray-500 mb-4">You haven't added any restaurants yet.</p>
      <Button onClick={() => navigate('/dashboard/add-restaurant')}>
        Add Your First Restaurant
      </Button>
    </div>
  );
};

export default EmptyRestaurants;

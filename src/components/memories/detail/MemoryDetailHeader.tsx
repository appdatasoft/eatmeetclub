
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemoryDetailHeaderProps {
  id: string;
  isOwner: boolean;
  onDeleteClick: () => void;
}

const MemoryDetailHeader = ({ id, isOwner, onDeleteClick }: MemoryDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" onClick={() => navigate('/dashboard/memories')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Memories
      </Button>
      
      {isOwner && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dashboard/memories/edit/${id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          <Button variant="destructive" onClick={onDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemoryDetailHeader;

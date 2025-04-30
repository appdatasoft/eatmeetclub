
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemoryWithRelations } from "@/types/memory";
import { Calendar, MapPin, Users, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface MemoryInfoProps {
  memory: MemoryWithRelations;
}

const MemoryInfo = ({ memory }: MemoryInfoProps) => {
  const formattedDate = memory.date ? format(new Date(memory.date), 'MMMM d, yyyy') : '';
  
  // Privacy badge color
  const privacyColor = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    unlisted: 'bg-amber-100 text-amber-800',
  }[memory.privacy];

  return (
    <div className="w-full md:w-1/2 space-y-4">
      <div>
        <h3 className="text-lg font-medium">Memory Details</h3>
        <Separator className="my-2" />
        
        <div className="space-y-3 mt-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{memory.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>{memory.attendees?.length || 0} attendees</span>
          </div>
        </div>
      </div>
      
      {memory.restaurant && (
        <div>
          <h3 className="text-lg font-medium">Restaurant</h3>
          <Separator className="my-2" />
          <p>{memory.restaurant.name}</p>
          <p className="text-sm text-gray-600">{memory.restaurant.address}, {memory.restaurant.city}</p>
        </div>
      )}
      
      {memory.event && (
        <div>
          <h3 className="text-lg font-medium">Event</h3>
          <Separator className="my-2" />
          <p>{memory.event.title}</p>
          <p className="text-sm text-gray-600">{format(new Date(memory.event.date), 'MMM d, yyyy')}</p>
        </div>
      )}
      
      <Button className="w-full">
        <Share2 className="mr-2 h-4 w-4" />
        Share Memory
      </Button>
    </div>
  );
};

export default MemoryInfo;

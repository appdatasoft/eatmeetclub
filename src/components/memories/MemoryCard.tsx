
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MemoryWithRelations } from '@/types/memory';
import { Eye, Share2, Users, Utensils, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MemoryCardProps {
  memory: MemoryWithRelations;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const navigate = useNavigate();
  
  // Find the first photo to display
  const photoContent = memory.content?.find(c => c.content_type === 'photo');
  
  // Format date
  const formattedDate = format(new Date(memory.date), 'MMM d, yyyy');
  
  // Privacy badge color
  const privacyColor = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    unlisted: 'bg-amber-100 text-amber-800',
  }[memory.privacy];

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {photoContent?.content_url ? (
        <div className="h-48 overflow-hidden">
          <img 
            src={photoContent.content_url} 
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No image</span>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{memory.title}</CardTitle>
          <Badge className={privacyColor}>
            {memory.privacy}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{formattedDate}</span>
          </div>
          
          {memory.restaurant && (
            <div className="flex items-center">
              <Utensils className="h-4 w-4 mr-2 text-gray-500" />
              <span>{memory.restaurant.name}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>{memory.attendees?.length || 0} attendees</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/dashboard/memories/${memory.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemoryCard;


import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2 } from "lucide-react";
import QRCode from "./QRCode";
import { useToast } from "@/hooks/use-toast";

interface EventActionButtonsProps {
  eventUrl: string;
  eventTitle: string;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
  isPublished?: boolean;
}

const EventActionButtons = ({
  eventUrl,
  eventTitle,
  onEditEvent,
  onDeleteEvent,
  isPublished = true
}: EventActionButtonsProps) => {
  const { toast } = useToast();
  
  const handleShareClick = () => {
    navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Link Copied",
      description: "Event link has been copied to clipboard"
    });
  };

  return (
    <>
      {isPublished && <QRCode url={eventUrl} eventTitle={eventTitle} />}
      
      <div className="flex space-x-2">
        {isPublished && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          onClick={onEditEvent}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex items-center" 
          onClick={onDeleteEvent}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
    </>
  );
};

export default EventActionButtons;

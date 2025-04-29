
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2 } from "lucide-react";
import QRCode from "./QRCode";
import { useIsMobile } from "@/hooks/use-mobile";

interface EventActionsProps {
  eventUrl: string;
  eventTitle: string;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
  isPublished?: boolean;
}

const EventActions: React.FC<EventActionsProps> = ({
  eventUrl,
  eventTitle,
  onEditEvent,
  onDeleteEvent,
  isPublished = true
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} mb-4 ${isMobile ? 'space-y-2' : 'space-x-2'}`}>
      {isPublished && <QRCode url={eventUrl} eventTitle={eventTitle} />}
      <div className={`flex ${isMobile ? 'justify-end space-x-2' : ''}`}>
        {isPublished && (
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"} 
            className="flex items-center mr-2" 
            onClick={() => {
              navigator.clipboard.writeText(eventUrl);
              // Alert or toast notification could go here
            }}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        )}
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"} 
          className="flex items-center" 
          onClick={onEditEvent}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          variant="destructive" 
          size={isMobile ? "sm" : "sm"} 
          className="flex items-center" 
          onClick={onDeleteEvent}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default EventActions;

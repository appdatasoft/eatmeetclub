
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import QRCode from "./QRCode";
import { useIsMobile } from "@/hooks/use-mobile";

interface EventActionsProps {
  eventUrl: string;
  eventTitle: string;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
}

const EventActions: React.FC<EventActionsProps> = ({
  eventUrl,
  eventTitle,
  onEditEvent,
  onDeleteEvent,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} mb-4 ${isMobile ? 'space-y-2' : 'space-x-2'}`}>
      <QRCode url={eventUrl} eventTitle={eventTitle} />
      <div className={`flex ${isMobile ? 'justify-end space-x-2' : ''}`}>
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

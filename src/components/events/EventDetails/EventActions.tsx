
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import QRCode from "./QRCode";

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
  return (
    <div className="flex justify-end mb-4 space-x-2">
      <QRCode url={eventUrl} eventTitle={eventTitle} />
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
  );
};

export default EventActions;

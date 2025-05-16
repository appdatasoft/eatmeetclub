
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Event } from "./types";
import EventPublishControls from "./EventPublishControls";

interface EventActionButtonsProps {
  event: Event;
  onRefresh?: () => void;
}

const EventActionButtons = ({ event, onRefresh }: EventActionButtonsProps) => {
  const navigate = useNavigate();
  
  return (
    <div>
      {event.payment_status === 'completed' ? (
        <div className="flex items-center space-x-2">
          <EventPublishControls event={event} onRefresh={onRefresh} />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/edit-event/${event.id}`)}
            disabled={event.published}
            title={event.published ? "Published events cannot be edited" : "Edit event"}
          >
            Edit
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/dashboard/payment/${event.id}`)}
        >
          Complete Payment
        </Button>
      )}
    </div>
  );
};

export default EventActionButtons;

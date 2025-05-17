
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  eventId?: string;
}

const ActionButtons = ({ eventId }: ActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center space-x-4">
      <button
        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
        onClick={() => navigate(`/event/${eventId}`)}
      >
        View Event
      </button>
      <button
        className="bg-gray-100 text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
        onClick={() => navigate("/events")}
      >
        Browse More Events
      </button>
    </div>
  );
};

export default ActionButtons;

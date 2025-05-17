
import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

interface EventInfoProps {
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  ticketsRemaining: number;
  ticketsPercentage: number;
}

const EventInfo: React.FC<EventInfoProps> = ({
  description,
  date,
  time,
  location,
  capacity,
  ticketsRemaining,
  ticketsPercentage,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">Event Details</h2>
      <p className="text-gray-700 mb-6">{description || "Join us for this special culinary event!"}</p>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-3">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{date}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{time}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{location || "Address not available"}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Tickets Remaining</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className="bg-teal-500 h-2.5 rounded-full" 
            style={{ width: `${ticketsPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {ticketsRemaining} of {capacity} tickets remaining
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Important Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Please arrive 15 minutes before the event starts</li>
          <li>Dietary restrictions can be accommodated with 48h notice</li>
          <li>Tickets are non-refundable but can be transferred</li>
        </ul>
      </div>
    </div>
  );
};

export default EventInfo;

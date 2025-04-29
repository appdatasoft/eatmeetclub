
import React from "react";

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
            <svg className="w-5 h-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{date}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <svg className="w-5 h-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{time}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{location}</p>
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

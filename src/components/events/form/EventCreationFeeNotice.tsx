
import React from 'react';

interface EventCreationFeeNoticeProps {
  eventFee: number;
  isNewEvent: boolean;
}

const EventCreationFeeNotice = ({ eventFee, isNewEvent }: EventCreationFeeNoticeProps) => {
  if (!isNewEvent) return null;
  
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <p className="text-amber-800 text-sm font-medium">
        A ${eventFee.toFixed(2)} event creation fee will be charged when you add this event.
      </p>
    </div>
  );
};

export default EventCreationFeeNotice;

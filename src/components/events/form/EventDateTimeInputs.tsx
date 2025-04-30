
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EventDateTimeInputsProps {
  eventDate: string;
  eventTime: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EventDateTimeInputs = ({ 
  eventDate, 
  eventTime, 
  handleChange 
}: EventDateTimeInputsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="eventDate">Event Date*</Label>
        <Input 
          id="eventDate" 
          name="eventDate" 
          type="date" 
          required 
          value={eventDate}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="eventTime">Event Time*</Label>
        <Input 
          id="eventTime" 
          name="eventTime" 
          type="time" 
          required 
          value={eventTime}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default EventDateTimeInputs;


import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventBasicInfoProps {
  eventTitle: string;
  eventDescription: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EventBasicInfo = ({
  eventTitle,
  eventDescription,
  handleChange
}: EventBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="eventTitle">Event Title*</Label>
        <Input 
          id="eventTitle" 
          name="eventTitle" 
          required 
          placeholder="Give your event a catchy title" 
          value={eventTitle}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="eventDescription">Description*</Label>
        <Textarea 
          id="eventDescription"
          name="eventDescription" 
          required 
          placeholder="Describe what makes this event special..." 
          className="min-h-[120px]"
          value={eventDescription}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default EventBasicInfo;


import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EventCapacityPriceInputsProps {
  capacity: string;
  price: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EventCapacityPriceInputs = ({
  capacity,
  price,
  handleChange
}: EventCapacityPriceInputsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity*</Label>
        <Input 
          id="capacity" 
          name="capacity" 
          type="number" 
          min="1" 
          required 
          placeholder="Number of seats available"
          value={capacity}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price per Person*</Label>
        <Input 
          id="price" 
          name="price" 
          type="number" 
          min="0" 
          step="0.01" 
          required 
          placeholder="Ticket price per person"
          value={price}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default EventCapacityPriceInputs;

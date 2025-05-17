
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicDetailsProps {
  name: string;
  description: string;
  price: number;
  type: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (value: string) => void;
}

const MENU_ITEM_TYPES = [
  "Appetizer",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Beverage",
  "Special"
];

const BasicDetails: React.FC<BasicDetailsProps> = ({
  name,
  description,
  price,
  type,
  onNameChange,
  onDescriptionChange,
  onPriceChange,
  onTypeChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-900">Food Item Name*</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onNameChange}
          placeholder="e.g., Margherita Pizza"
          required
          className="bg-white border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-gray-900">Type*</Label>
        <Select
          value={type}
          onValueChange={onTypeChange}
          required
        >
          <SelectTrigger className="bg-white border-gray-300">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {MENU_ITEM_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={onDescriptionChange}
          placeholder="Describe this food item..."
          rows={3}
          className="bg-white border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price" className="text-gray-900">Price*</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={onPriceChange}
          required
          className="bg-white border-gray-300"
        />
      </div>
    </>
  );
};

export default BasicDetails;

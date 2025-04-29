
import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RestaurantFormValues } from './schema/restaurantFormSchema';

interface AddRestaurantFormProps {
  onSubmit: (data: RestaurantFormValues & { restaurantDescription: string }) => Promise<void>;
  isLoading: boolean;
}

const AddRestaurantForm = ({ onSubmit, isLoading }: AddRestaurantFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    restaurantDescription: '',
    cuisine_type: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    phone: '',
    website: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform the form data to match the schema expected by RestaurantFormValues
    const restaurantData = {
      name: formData.name,
      restaurantDescription: formData.restaurantDescription,
      cuisine_type: formData.cuisine_type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      phone: formData.phone,
      website: formData.website
    };
    
    await onSubmit(restaurantData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Restaurant Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="name">Restaurant Name*</Label>
          <Input 
            id="name" 
            required 
            placeholder="Your restaurant name" 
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantDescription">Description*</Label>
          <Textarea 
            id="restaurantDescription" 
            required 
            placeholder="Describe your restaurant, its atmosphere, and what makes it special..." 
            className="min-h-[120px]"
            value={formData.restaurantDescription}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cuisine_type">Cuisine Type*</Label>
          <Input 
            id="cuisine_type" 
            required 
            placeholder="e.g., Italian, Japanese, etc." 
            value={formData.cuisine_type}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address*</Label>
          <Input 
            id="address" 
            required 
            placeholder="Full restaurant address" 
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City*</Label>
            <Input 
              id="city" 
              required 
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province*</Label>
            <Input 
              id="state" 
              required 
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipcode">Zip/Postal Code*</Label>
            <Input 
              id="zipcode" 
              required 
              value={formData.zipcode}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number*</Label>
            <Input 
              id="phone" 
              type="tel" 
              required 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              type="url" 
              placeholder="https://your-restaurant.com" 
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      
      <div>
        <Button type="submit" isLoading={isLoading}>
          Add Restaurant
        </Button>
      </div>
    </form>
  );
};

export default AddRestaurantForm;

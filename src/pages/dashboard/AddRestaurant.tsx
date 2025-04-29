
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AddRestaurant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantDescription: '',
    cuisineType: '',
    restaurantAddress: '',
    city: '',
    state: '',
    zipcode: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to add a restaurant');
      }

      // Insert the restaurant data into the database
      const { data, error } = await supabase
        .from('restaurants')
        .insert([
          { 
            user_id: session.user.id,
            name: formData.restaurantName,
            description: formData.restaurantDescription,
            cuisine_type: formData.cuisineType,
            address: formData.restaurantAddress,
            city: formData.city,
            state: formData.state,
            zipcode: formData.zipcode,
            phone: formData.phone,
            website: formData.website || null
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Restaurant added",
        description: "Your restaurant has been added successfully."
      });
      
      // Navigate to the dashboard or create event page
      navigate('/dashboard/create-event');
    } catch (error: any) {
      console.error('Error adding restaurant:', error);
      toast({
        title: "Error adding restaurant",
        description: error.message || "There was an error adding your restaurant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Add New Restaurant</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Restaurant Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="restaurantName">Restaurant Name*</Label>
            <Input 
              id="restaurantName" 
              required 
              placeholder="Your restaurant name" 
              value={formData.restaurantName}
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
            <Label htmlFor="cuisineType">Cuisine Type*</Label>
            <Input 
              id="cuisineType" 
              required 
              placeholder="e.g., Italian, Japanese, etc." 
              value={formData.cuisineType}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">Address*</Label>
            <Input 
              id="restaurantAddress" 
              required 
              placeholder="Full restaurant address" 
              value={formData.restaurantAddress}
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
    </DashboardLayout>
  );
};

export default AddRestaurant;

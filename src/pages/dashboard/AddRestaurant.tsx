
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Restaurant added",
        description: "Your restaurant has been added successfully."
      });
      navigate('/dashboard/create-event');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Add New Restaurant</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Restaurant Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="restaurantName">Restaurant Name*</Label>
            <Input id="restaurantName" required placeholder="Your restaurant name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">Description*</Label>
            <Textarea 
              id="restaurantDescription" 
              required 
              placeholder="Describe your restaurant, its atmosphere, and what makes it special..." 
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cuisineType">Cuisine Type*</Label>
            <Input id="cuisineType" required placeholder="e.g., Italian, Japanese, etc." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">Address*</Label>
            <Input id="restaurantAddress" required placeholder="Full restaurant address" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City*</Label>
              <Input id="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province*</Label>
              <Input id="state" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zip/Postal Code*</Label>
              <Input id="zipcode" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input id="phone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://your-restaurant.com" />
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

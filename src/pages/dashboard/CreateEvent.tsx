
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  // Extract restaurantId from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const restaurantId = params.get('restaurantId');
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        // Fetch user's restaurants
        fetchRestaurants();
      }
    };
    
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name')
          .order('name', { ascending: true });
        
        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast({
          title: "Error",
          description: "Failed to fetch restaurants. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Event created",
        description: "Your event has been created successfully."
      });
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Event Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title*</Label>
            <Input id="eventTitle" required placeholder="Give your event a catchy title" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description*</Label>
            <Textarea 
              id="eventDescription" 
              required 
              placeholder="Describe what makes this event special..." 
              className="min-h-[120px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date*</Label>
              <Input id="eventDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time*</Label>
              <Input id="eventTime" type="time" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurant">Select Restaurant*</Label>
            {restaurants.length > 0 ? (
              <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-amber-600">You don't have any restaurants yet.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/add-restaurant')}
                >
                  Add a Restaurant First
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity*</Label>
              <Input id="capacity" type="number" min="1" required placeholder="Number of seats available" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Person ($)*</Label>
              <Input id="price" type="number" min="0" step="0.01" required placeholder="0.00" />
            </div>
          </div>
        </div>
        
        <div>
          <Button type="submit" isLoading={isLoading}>
            Create Event
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CreateEvent;

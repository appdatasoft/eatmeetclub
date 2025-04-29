
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          .select('id, name, cuisine_type, city, state')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard/create-event')}
              className="w-full py-2 px-4 bg-brand-50 text-brand-600 rounded-md text-sm font-medium text-left hover:bg-brand-100"
            >
              Create New Event
            </button>
            <button 
              onClick={() => navigate('/dashboard/add-restaurant')}
              className="w-full py-2 px-4 bg-brand-50 text-brand-600 rounded-md text-sm font-medium text-left hover:bg-brand-100"
            >
              Add New Restaurant
            </button>
          </div>
        </div>
        
        <div className="border border-gray-100 rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
          <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
        </div>
      </div>
      
      <div className="mt-6 border border-gray-100 rounded-lg p-5">
        <h3 className="text-lg font-medium mb-4">Your Restaurants</h3>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full"></div>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-lg">{restaurant.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{restaurant.cuisine_type}</p>
                <p className="text-xs text-gray-500 mt-2">{restaurant.city}, {restaurant.state}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No restaurants added yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

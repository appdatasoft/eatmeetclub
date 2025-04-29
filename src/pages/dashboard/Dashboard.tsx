
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, ExternalLinkIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  website: string | null;
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
          .select('id, name, cuisine_type, city, state, address, phone, website')
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => navigate('/dashboard/create-event')}
              className="w-full justify-start"
              variant="outline"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
            <Button
              onClick={() => navigate('/dashboard/add-restaurant')}
              className="w-full justify-start"
              variant="outline"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Restaurant
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Restaurants</CardTitle>
          <CardDescription>Restaurants you've added to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.cuisine_type}</TableCell>
                      <TableCell>{restaurant.city}, {restaurant.state}</TableCell>
                      <TableCell>{restaurant.phone}</TableCell>
                      <TableCell>
                        {restaurant.website && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(restaurant.website!, '_blank')}
                            title="Visit Website"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You haven't added any restaurants yet.</p>
              <Button onClick={() => navigate('/dashboard/add-restaurant')}>
                Add Your First Restaurant
              </Button>
            </div>
          )}
        </CardContent>
        {restaurants.length > 0 && (
          <CardFooter>
            <Button onClick={() => navigate('/dashboard/add-restaurant')}>
              Add Another Restaurant
            </Button>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;

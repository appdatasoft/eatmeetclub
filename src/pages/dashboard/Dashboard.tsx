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
import { PlusIcon, ExternalLinkIcon, CalendarPlus, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import EditRestaurantDialog from '@/components/restaurants/EditRestaurantDialog';
import DeleteRestaurantDialog from '@/components/restaurants/DeleteRestaurantDialog';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  website: string | null;
  zipcode: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant_id: string;
  capacity: number;
  price: number;
  payment_status: string; 
  restaurant: {
    name: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for edit/delete restaurant dialogs
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRestaurant, setDeleteRestaurant] = useState<{id: string, name: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to fetch restaurants
  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, city, state, address, phone, website, zipcode')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };
  
  // Function to fetch events
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, restaurant_id, capacity, price, payment_status, restaurant:restaurants(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        // Fetch user's restaurants and events
        fetchRestaurants();
        fetchEvents();
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleCreateEvent = (restaurantId: string) => {
    navigate(`/dashboard/create-event?restaurantId=${restaurantId}`);
  };

  const handlePublishEvent = async (eventId: string, paymentStatus: string) => {
    if (paymentStatus !== 'completed') {
      toast({
        title: "Payment Required",
        description: "You need to complete the payment before publishing this event",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send the event to be published
    toast({
      title: "Event Published",
      description: "Your event has been published successfully"
    });
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Restaurant editing functions
  const openEditDialog = (restaurant: Restaurant) => {
    setEditRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteRestaurant({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleRestaurantEdit = () => {
    // Refresh the restaurant list
    fetchRestaurants();
  };

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
            <CardTitle>Event Stats</CardTitle>
            <CardDescription>Overview of your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-500">Total Events</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {events.filter(event => event.payment_status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500">Ready to Publish</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>All events you've created</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.restaurant?.name}</TableCell>
                      <TableCell>{formatEventDate(event.date)}</TableCell>
                      <TableCell>${event.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {event.payment_status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
                            <AlertCircle className="h-3 w-3 mr-1" /> Payment Required
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.payment_status === 'completed' ? (
                          <Button
                            size="sm"
                            onClick={() => handlePublishEvent(event.id, event.payment_status)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Publish Event
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard/payment/${event.id}`)}
                          >
                            Complete Payment
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
              <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
              <Button onClick={() => navigate('/dashboard/create-event')}>
                Create Your First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
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
                      <TableCell className="space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateEvent(restaurant.id)}
                          title="Add Event"
                        >
                          <CalendarPlus className="h-4 w-4" />
                          <span className="ml-1 hidden md:inline">Add Event</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(restaurant)}
                          title="Edit Restaurant"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-1 hidden md:inline">Edit</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteDialog(restaurant.id, restaurant.name)}
                          title="Delete Restaurant"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1 hidden md:inline">Delete</span>
                        </Button>
                        
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

      {/* Edit Restaurant Dialog */}
      {editRestaurant && (
        <EditRestaurantDialog
          restaurant={editRestaurant}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleRestaurantEdit}
        />
      )}

      {/* Delete Restaurant Dialog */}
      {deleteRestaurant && (
        <DeleteRestaurantDialog
          restaurantId={deleteRestaurant.id}
          restaurantName={deleteRestaurant.name}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleRestaurantEdit}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;


import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuickActions from "@/components/dashboard/QuickActions";
import EventsList from "@/components/dashboard/EventsList";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RestaurantsList from "@/components/dashboard/RestaurantsList";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTickets from "@/components/dashboard/UserTickets";
import { Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  
  // Fetch restaurants if the user is an admin
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user || !isAdmin) {
        setIsLoadingRestaurants(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');
          
        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    
    fetchRestaurants();
  }, [user, isAdmin]);
  
  // Function to refresh restaurants after updates
  const refreshRestaurants = async () => {
    if (!user || !isAdmin) return;
    
    try {
      setIsLoadingRestaurants(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
        
      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error refreshing restaurants:', error);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-gray-500">Please wait while we load your dashboard</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container-custom py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-1">
              <Ticket className="h-4 w-4" /> My Tickets
            </TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <QuickActions />
            <UpcomingEvents />
          </TabsContent>
          
          <TabsContent value="tickets">
            <UserTickets userId={user.id} />
          </TabsContent>
          
          <TabsContent value="my-events">
            <EventsList />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="restaurants">
              <RestaurantsList 
                restaurants={restaurants} 
                isLoading={isLoadingRestaurants} 
                onRestaurantUpdate={refreshRestaurants} 
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

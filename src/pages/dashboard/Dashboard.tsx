
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuickActions from "@/components/dashboard/QuickActions";
import EventsList from "@/components/dashboard/EventsList";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RestaurantsList from "@/components/dashboard/RestaurantsList";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTickets from "@/components/dashboard/UserTickets";
import { Ticket } from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
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
              <RestaurantsList />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

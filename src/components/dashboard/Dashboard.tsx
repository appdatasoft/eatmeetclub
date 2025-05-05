
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MembershipStatus } from "./MembershipStatus";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Receipt } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import MembershipOrders from "./MembershipOrders";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="container max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Welcome, {user?.user_metadata?.name || user.email}</CardTitle>
              <CardDescription>
                Manage your membership and explore upcoming dining experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-4 mt-4">
                <Button onClick={() => navigate("/events")} className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Browse Events
                </Button>
                <Button onClick={() => navigate("/create-event")} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Host an Event
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <MembershipOrders />
        </div>
        
        <div className="space-y-6">
          <MembershipStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

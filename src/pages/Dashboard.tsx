
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    getProfile();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userName}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your personal dashboard where you can manage your food events and bookings.</p>
          </CardContent>
        </Card>
        
        {/* More dashboard content can be added here */}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;


import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import BecomeMember from "@/pages/BecomeMember";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";
import Dashboard from "@/pages/dashboard/Dashboard";
import EventsManagement from "@/pages/dashboard/EventsManagement";
import CreateEvent from "@/pages/dashboard/CreateEvent";
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";
import Events from "@/pages/Events";
import EventDetailsPage from "@/pages/EventDetailsPage";
import VenuesPage from "@/pages/VenuesPage";
import RestaurantDetailsPage from "@/pages/RestaurantDetailsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ConfigPage from "@/pages/admin/ConfigPage";
import UsersPage from "@/pages/admin/UsersPage";
import AdminSettings from "@/pages/dashboard/AdminSettings";
import AddRestaurant from "@/pages/dashboard/AddRestaurant";
import EditEvent from "@/pages/EditEvent";
import Signup from "@/pages/Signup";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";

function App() {
  // Validate Supabase connection on app startup
  useEffect(() => {
    // Simple health check to verify Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        // Minimal request to check if Supabase is responding
        const { error } = await supabase.from('app_config').select('key').limit(1);
        if (error) {
          console.error('Supabase connection check failed:', error);
        } else {
          console.log('Supabase connection successful');
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <BrowserRouter>
      <EditableContentProvider>
        <Routes>
          {/* Route to home page */}
          <Route path="/" element={<Index />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/membership-payment" element={<MembershipPayment />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/become-member" element={<BecomeMember />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          
          {/* New routes for events and venues */}
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/config" element={<ConfigPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/events" element={<EventsManagement />} />
          <Route path="/dashboard/create-event" element={<CreateEvent />} />
          <Route path="/dashboard/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/dashboard/admin-settings" element={<AdminSettings />} />
          <Route path="/dashboard/add-restaurant" element={<AddRestaurant />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </EditableContentProvider>
    </BrowserRouter>
  );
}

export default App;

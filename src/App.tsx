
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
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";
import Events from "@/pages/Events";
import VenuesPage from "@/pages/VenuesPage";
import RestaurantDetailsPage from "@/pages/RestaurantDetailsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ConfigPage from "@/pages/admin/ConfigPage";
import UsersPage from "@/pages/admin/UsersPage";
import AdminSettings from "@/pages/dashboard/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route to home page */}
        <Route path="/" element={<Index />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/membership-payment" element={<MembershipPayment />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/become-member" element={<BecomeMember />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        
        {/* New routes for events and venues */}
        <Route path="/events" element={<Events />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/config" element={<ConfigPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard/admin-settings" element={<AdminSettings />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

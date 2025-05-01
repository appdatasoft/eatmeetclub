import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignupContainer from "@/components/signup/SignupContainer";
import Dashboard from "@/pages/Dashboard";
import EventDetails from "@/pages/EventDetails";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSettings from "@/pages/admin/AdminSettings";
import NotFound from "@/pages/NotFound";
import BecomeMember from "@/pages/BecomeMember";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import EventCheckout from "@/pages/EventCheckout";
import EventSuccess from "@/pages/EventSuccess";
import UserProfile from "@/pages/UserProfile";
import EditProfile from "@/pages/EditProfile";
import MyEvents from "@/pages/MyEvents";
import MyTickets from "@/pages/MyTickets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Direct access to membership checkout */}
        <Route path="/membership-payment" element={<MembershipPayment />} />
        
        {/* Use the membership route directly, skipping the two-step process */}
        <Route path="/become-member" element={<Navigate to="/membership-payment" />} />
        
        {/* Keep the old signup route for backward compatibility */}
        <Route path="/signup" element={<SignupContainer />} />
        
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/events/:eventId/checkout" element={<EventCheckout />} />
        <Route path="/events/:eventId/success" element={<EventSuccess />} />
        
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:eventId/edit" element={<EditEvent />} />
        </Route>
        
        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

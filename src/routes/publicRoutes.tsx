
import { Route } from "react-router-dom";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import BecomeMember from "@/pages/BecomeMember";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";
import Vision from "@/pages/Vision";
import Mission from "@/pages/Mission";
import Events from "@/pages/Events";
import EventDetailsPage from "@/pages/EventDetailsPage";
import VenuesPage from "@/pages/VenuesPage";
import RestaurantDetailsPage from "@/pages/RestaurantDetailsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import About from "@/pages/About";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Register from "@/pages/Register";
import AuthRedirect from "@/components/auth/AuthRedirect";

export const PublicRoutes = () => {
  return (
    <>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={
        <AuthRedirect>
          <Login />
        </AuthRedirect>
      } />
      <Route path="/signup" element={
        <AuthRedirect>
          <Signup />
        </AuthRedirect>
      } />
      <Route path="/register" element={
        <AuthRedirect>
          <Register />
        </AuthRedirect>
      } />
      <Route path="/forgot-password" element={
        <AuthRedirect>
          <ForgotPassword />
        </AuthRedirect>
      } />
      <Route path="/membership-payment" element={<MembershipPayment />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/become-member" element={<BecomeMember />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/vision" element={<Vision />} />
      <Route path="/mission" element={<Mission />} />
      <Route path="/about" element={<About />} />
      
      {/* Public routes with optional authentication */}
      <Route path="/events" element={<Events />} />
      <Route path="/event/:id" element={<EventDetailsPage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
      
      {/* Profile routes */}
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/profile/:id" element={<UserProfilePage />} />
    </>
  );
};

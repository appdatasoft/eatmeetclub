import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";
import { AdminRoutes } from "@/routes/adminRoutes";
import { DashboardRoutes } from "@/routes/dashboardRoutes";
import NotFound from "@/pages/NotFound";

// Public route pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
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
import AuthRedirect from "@/components/auth/AuthRedirect";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EditableContentProvider>
          <Routes>
            {/* Inline Public Routes */}
            <Route index element={<Index />} />
            <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
            <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
            <Route path="/forgot-password" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
            <Route path="/membership-payment" element={<MembershipPayment />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/become-member" element={<BecomeMember />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />

            {/* Admin + Dashboard */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/dashboard/*" element={<DashboardRoutes />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </EditableContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

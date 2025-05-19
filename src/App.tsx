
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import BecomeMember from "@/pages/BecomeMember";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";
import Vision from "@/pages/Vision";
import Mission from "@/pages/Mission";
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
import RestaurantMenu from "@/pages/dashboard/RestaurantMenu";
import EditEvent from "@/pages/EditEvent";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import About from "@/pages/About";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthRedirect from "@/components/auth/AuthRedirect";
import Settings from "@/pages/dashboard/Settings";
import UserProfilePage from "@/pages/UserProfilePage";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminEmails from "@/pages/admin/AdminEmails";
import AdminSMS from "@/pages/admin/AdminSMS";
import AdminVenus from "@/pages/admin/AdminVenus";
import AdminEvents from "@/pages/admin/AdminEvents";

function App() {
  return (
    <BrowserRouter>
      <EditableContentProvider>
        <Routes>
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
          
          {/* Protected routes */}
          <Route path="/edit-event/:id" element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/contracts" element={
            <ProtectedRoute adminOnly={true}>
              <AdminContracts />
            </ProtectedRoute>
          } />
          <Route path="/admin/emails" element={
            <ProtectedRoute adminOnly={true}>
              <AdminEmails />
            </ProtectedRoute>
          } />
          <Route path="/admin/sms" element={
            <ProtectedRoute adminOnly={true}>
              <AdminSMS />
            </ProtectedRoute>
          } />
          <Route path="/admin/venus" element={
            <ProtectedRoute adminOnly={true}>
              <AdminVenus />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute adminOnly={true}>
              <AdminEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/config" element={
            <ProtectedRoute adminOnly={true}>
              <ConfigPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <UsersPage />
            </ProtectedRoute>
          } />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/events" element={
            <ProtectedRoute>
              <EventsManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/create-event" element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin-settings" element={
            <ProtectedRoute adminOnly={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/add-restaurant" element={
            <ProtectedRoute>
              <AddRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/restaurant-menu/:id" element={
            <ProtectedRoute>
              <RestaurantMenu />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </EditableContentProvider>
    </BrowserRouter>
  );
}

export default App;

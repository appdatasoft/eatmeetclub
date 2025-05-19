
import { Route } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import EventsManagement from "@/pages/dashboard/EventsManagement";
import CreateEvent from "@/pages/dashboard/CreateEvent";
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";
import Settings from "@/pages/dashboard/Settings";
import AdminSettings from "@/pages/dashboard/AdminSettings";
import AddRestaurant from "@/pages/dashboard/AddRestaurant";
import RestaurantMenu from "@/pages/dashboard/RestaurantMenu";
import EditEvent from "@/pages/EditEvent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const DashboardRoutes = () => {
  return (
    <>
      {/* Protected routes */}
      <Route path="/edit-event/:id" element={
        <ProtectedRoute>
          <EditEvent />
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
    </>
  );
};

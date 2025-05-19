
import { Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import EventsManagement from "@/pages/dashboard/EventsManagement";
import CreateEvent from "@/pages/dashboard/CreateEvent";
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";
import Settings from "@/pages/dashboard/Settings";
import AdminSettings from "@/pages/dashboard/AdminSettings";
import AddRestaurant from "@/pages/dashboard/AddRestaurant";
import RestaurantMenu from "@/pages/dashboard/RestaurantMenu";
import SocialMedia from "@/pages/dashboard/SocialMedia";
import EditEvent from "@/pages/EditEvent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="events" element={
        <ProtectedRoute>
          <EventsManagement />
        </ProtectedRoute>
      } />
      <Route path="create-event" element={
        <ProtectedRoute>
          <CreateEvent />
        </ProtectedRoute>
      } />
      <Route path="payment-success" element={
        <ProtectedRoute>
          <PaymentSuccessPage />
        </ProtectedRoute>
      } />
      <Route path="settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="social-media" element={
        <ProtectedRoute>
          <SocialMedia />
        </ProtectedRoute>
      } />
      <Route path="admin-settings" element={
        <ProtectedRoute adminOnly={true}>
          <AdminSettings />
        </ProtectedRoute>
      } />
      <Route path="add-restaurant" element={
        <ProtectedRoute>
          <AddRestaurant />
        </ProtectedRoute>
      } />
      <Route path="restaurant-menu/:id" element={
        <ProtectedRoute>
          <RestaurantMenu />
        </ProtectedRoute>
      } />
      <Route path="../edit-event/:id" element={
        <ProtectedRoute>
          <EditEvent />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

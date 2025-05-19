
import { Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import AddRestaurant from "@/pages/dashboard/AddRestaurant";
import CreateEvent from "@/pages/dashboard/CreateEvent";
import EventsManagement from "@/pages/dashboard/EventsManagement";
import MyAccount from "@/pages/dashboard/MyAccount";
import Settings from "@/pages/dashboard/Settings";
import RestaurantMenu from "@/pages/dashboard/RestaurantMenu";
import PaymentsPage from "@/pages/dashboard/PaymentsPage";
import SocialMedia from "@/pages/dashboard/SocialMedia";
import Memories from "@/pages/dashboard/Memories";
import CreateMemory from "@/pages/dashboard/CreateMemory";
import MemoryDetail from "@/pages/dashboard/MemoryDetail";
import EditMemory from "@/pages/dashboard/EditMemory";
import EventPayment from "@/pages/dashboard/EventPayment";
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="/add-restaurant" element={<AddRestaurant />} />
      <Route path="/restaurant-menu/:id" element={<RestaurantMenu />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/events" element={<EventsManagement />} />
      <Route path="/my-account" element={<MyAccount />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/social-media" element={<SocialMedia />} />
      <Route path="/memories" element={<Memories />} />
      <Route path="/create-memory" element={<CreateMemory />} />
      <Route path="/memory/:id" element={<MemoryDetail />} />
      <Route path="/memory/:id/edit" element={<EditMemory />} />
      <Route path="/event-payment/:eventId" element={<EventPayment />} />
      <Route path="/payment-success/:paymentId" element={<PaymentSuccessPage />} />
    </Routes>
  );
};

export { DashboardRoutes };

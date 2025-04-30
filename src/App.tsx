
import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Signup from "./pages/Signup";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Events from "./pages/Events";
import VenuesPage from "./pages/VenuesPage";
import NotFound from "./pages/NotFound";
import EventDetailsPage from "./pages/EventDetailsPage";
import MembershipPayment from "./pages/MembershipPayment";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import EventDetails from "./pages/EventDetails";
import TicketSuccess from "./pages/TicketSuccess";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ConfigPage from "./pages/admin/ConfigPage";
import UsersPage from "./pages/admin/UsersPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Memories from "./pages/dashboard/Memories";
import CreateMemory from "./pages/dashboard/CreateMemory";
import MemoryDetail from "./pages/dashboard/MemoryDetail";
import EditMemory from "./pages/dashboard/EditMemory";
import Settings from "./pages/dashboard/Settings";
import AddRestaurant from "./pages/dashboard/AddRestaurant";
import AdminSettings from "./pages/dashboard/AdminSettings";
import Users from "./pages/dashboard/Users";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EventPayment from "./pages/dashboard/EventPayment";
import PaymentSuccessPage from "./pages/dashboard/PaymentSuccessPage";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/event/:id/tickets/success" element={<TicketSuccess />} />
      <Route path="/membership-payment" element={<MembershipPayment />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/venues/:id" element={<RestaurantDetailsPage />} />
      <Route path="/profile/:id" element={<UserProfilePage />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/memories" element={<Memories />} />
      <Route path="/dashboard/create-memory" element={<CreateMemory />} />
      <Route path="/dashboard/memories/:id" element={<MemoryDetail />} />
      <Route path="/dashboard/memories/:id/edit" element={<EditMemory />} />
      <Route path="/dashboard/settings" element={<Settings />} />
      <Route path="/dashboard/add-restaurant" element={<AddRestaurant />} />
      <Route path="/dashboard/create-event" element={<CreateEvent />} />
      <Route path="/dashboard/event-payment" element={<EventPayment />} />
      <Route path="/dashboard/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/dashboard/admin-settings" element={<AdminSettings />} />
      <Route path="/dashboard/users" element={<Users />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/config" element={<ConfigPage />} />
      <Route path="/admin/users" element={<UsersPage />} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

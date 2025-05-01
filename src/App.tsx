
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Index from './pages/Index';
import Events from './pages/Events';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import EventDetailsPage from './pages/EventDetailsPage';
import EventDetails from './pages/EventDetails';
import Signup from './pages/Signup';
import MembershipPayment from './pages/MembershipPayment';
import Dashboard from './pages/dashboard/Dashboard';
import EventsManagement from './pages/dashboard/EventsManagement';
import CreateEvent from './pages/dashboard/CreateEvent';
import EventPayment from './pages/dashboard/EventPayment';
import PaymentSuccessPage from './pages/dashboard/PaymentSuccessPage';
import AddRestaurant from './pages/dashboard/AddRestaurant';
import Settings from './pages/dashboard/Settings';
import AdminSettings from './pages/dashboard/AdminSettings';
import Users from './pages/dashboard/Users';
import CreateMemory from './pages/dashboard/CreateMemory';
import Memories from './pages/dashboard/Memories';
import MemoryDetail from './pages/dashboard/MemoryDetail';
import EditMemory from './pages/dashboard/EditMemory';
import VenuesPage from './pages/VenuesPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConfigPage from './pages/admin/ConfigPage';
import UsersPage from './pages/admin/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import TicketSuccess from './pages/TicketSuccess';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';

import './App.css'
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/venue/:id" element={<RestaurantDetailsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/membership-payment" element={<MembershipPayment />} />
        <Route path="/ticket-success" element={<TicketSuccess />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/events" element={<EventsManagement />} />
        <Route path="/dashboard/create-event" element={<CreateEvent />} />
        <Route path="/dashboard/payment/:id" element={<EventPayment />} />
        <Route path="/dashboard/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard/add-restaurant" element={<AddRestaurant />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/admin-settings" element={<AdminSettings />} />
        <Route path="/dashboard/users" element={<Users />} />
        <Route path="/dashboard/create-memory" element={<CreateMemory />} />
        <Route path="/dashboard/memories" element={<Memories />} />
        <Route path="/dashboard/memory/:id" element={<MemoryDetail />} />
        <Route path="/dashboard/edit-memory/:id" element={<EditMemory />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/config" element={<ConfigPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

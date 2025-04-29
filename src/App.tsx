
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import RestaurantJoin from "./pages/restaurants/RestaurantJoin";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateEvent from "./pages/dashboard/CreateEvent";
import PaymentSuccessPage from "./pages/dashboard/PaymentSuccessPage";
import AddRestaurant from "./pages/dashboard/AddRestaurant";
import EventPayment from './pages/dashboard/EventPayment';
import Settings from './pages/dashboard/Settings';
import AdminSettings from './pages/dashboard/AdminSettings';
import Users from './pages/dashboard/Users';
import TicketSuccess from "./pages/TicketSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/ticket-success" element={<TicketSuccess />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/restaurants/join" element={<RestaurantJoin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/create-event" element={<CreateEvent />} />
          <Route path="/dashboard/payment/:eventId" element={<EventPayment />} />
          <Route path="/dashboard/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/dashboard/add-restaurant" element={<AddRestaurant />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/admin-settings" element={<AdminSettings />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

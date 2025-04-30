
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MembershipPayment from "./pages/MembershipPayment";
import Dashboard from "./pages/dashboard/Dashboard";
import Events from "./pages/Events";
import EventDetailsPage from "./pages/EventDetailsPage";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import VenuesPage from "./pages/VenuesPage";
import UserProfilePage from "./pages/UserProfilePage";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventPayment from "./pages/dashboard/EventPayment";
import TicketSuccess from "./pages/TicketSuccess";
import AddRestaurant from "./pages/dashboard/AddRestaurant";
import HowItWorks from "./pages/HowItWorks";
import PaymentSuccessPage from "./pages/dashboard/PaymentSuccessPage";
import RestaurantJoin from "./pages/restaurants/RestaurantJoin";
import NotFound from "./pages/NotFound";
import Memories from "./pages/dashboard/Memories";
import CreateMemory from "./pages/dashboard/CreateMemory";
import MemoryDetail from "./pages/dashboard/MemoryDetail";
import EditMemory from "./pages/dashboard/EditMemory";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Check for pending redirect after login
    const checkPendingRedirect = async () => {
      const pendingPurchase = localStorage.getItem('pendingTicketPurchase');
      if (pendingPurchase && session) {
        const { redirectPath } = JSON.parse(pendingPurchase);
        if (redirectPath) {
          // Clear the pending purchase
          localStorage.removeItem('pendingTicketPurchase');
          window.location.href = redirectPath;
        }
      }
    };
    
    if (session) {
      checkPendingRedirect();
    }
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/become-member"
            element={!session ? <MembershipPayment /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!session ? <Signup /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/add-restaurant"
            element={session ? <AddRestaurant /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/create-event"
            element={session ? <CreateEvent /> : <Navigate to="/login" />}
          />
          {/* Memories Routes */}
          <Route
            path="/dashboard/memories"
            element={session ? <Memories /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/create-memory"
            element={session ? <CreateMemory /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/memories/:id"
            element={session ? <MemoryDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/memories/edit/:id"
            element={session ? <EditMemory /> : <Navigate to="/login" />}
          />
          <Route path="/events" element={<Events />} />
          <Route path="/venues" element={<VenuesPage />} />
          {/* Public event details page - no auth required */}
          <Route path="/event/:id" element={<EventDetailsPage />} />
          {/* New restaurant details page - no auth required */}
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
          {/* New user profile page - no auth required */}
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route
            path="/create-event"
            element={session ? <CreateEvent /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-event/:id"
            element={session ? <EditEvent /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/payment/:eventId"
            element={session ? <EventPayment /> : <Navigate to="/login" />}
          />
          <Route
            path="/event-payment/:eventId"
            element={session ? <EventPayment /> : <Navigate to="/login" />}
          />
          <Route
            path="/ticket-success"
            element={<TicketSuccess />}
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccessPage />}
          />
          <Route
            path="/restaurants/join"
            element={<RestaurantJoin />}
          />
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

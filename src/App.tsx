
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MembershipPayment from "./pages/MembershipPayment";
import Dashboard from "./pages/dashboard/Dashboard";
import Events from "./pages/Events";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventPayment from "./pages/dashboard/EventPayment";
import TicketSuccess from "./pages/TicketSuccess";
import AddRestaurant from "./pages/dashboard/AddRestaurant";
import HowItWorks from "./pages/HowItWorks";
import PaymentSuccessPage from "./pages/dashboard/PaymentSuccessPage";
import RestaurantJoin from "./pages/restaurants/RestaurantJoin";

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
        <Route path="/events" element={<Events />} />
        {/* Public event details page - no auth required */}
        <Route path="/event/:id" element={<EventDetailsPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;

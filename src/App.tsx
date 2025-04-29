
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
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventPayment from "./pages/dashboard/EventPayment";
import TicketSuccess from "./pages/TicketSuccess";
import AddRestaurant from "./pages/dashboard/AddRestaurant";
import HowItWorks from "./pages/HowItWorks";
import MembershipPayment from "./pages/MembershipPayment";
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
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
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
        <Route path="/event/:id" element={<EventDetails />} />
        <Route
          path="/create-event"
          element={session ? <CreateEvent /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-event/:id"
          element={session ? <EditEvent /> : <Navigate to="/login" />}
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
          path="/become-member"
          element={<MembershipPayment />}
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

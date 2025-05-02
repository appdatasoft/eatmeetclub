
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import BecomeMember from "@/pages/BecomeMember";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route to home page */}
        <Route path="/" element={<Index />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/membership-payment" element={<MembershipPayment />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/become-member" element={<BecomeMember />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import MembershipPayment from "@/pages/MembershipPayment";
import SetPassword from "@/pages/SetPassword";
import BecomeMember from "@/pages/BecomeMember";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to membership payment */}
        <Route path="/" element={<Navigate to="/membership-payment" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/membership-payment" element={<MembershipPayment />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/become-member" element={<BecomeMember />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

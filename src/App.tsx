
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";
import { PublicRoutes } from "@/routes/publicRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import dashboardRoutes from "@/routes/dashboardRoutes";
import NotFound from "@/pages/NotFound";
import AdminStripeSettings from '@/pages/admin/AdminStripeSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EditableContentProvider>
          <Routes>
            <>
              {/* Public routes */}
              <Route path="/*" element={<PublicRoutes />} />

              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Dashboard routes */}
              {dashboardRoutes}

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />

              {/* New route for Admin Stripe Settings */}
              <Route path="admin/stripe-settings" element={<AdminStripeSettings />} />
            </>
          </Routes>
          <Toaster />
        </EditableContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

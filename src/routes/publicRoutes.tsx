import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";
import { PublicRoutes } from "@/routes/publicRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { DashboardRoutes } from "@/routes/dashboardRoutes";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EditableContentProvider>
          <Routes>
            <>
              {/* Public routes */}
              <PublicRoutes />

              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Dashboard routes */}
              <Route path="/dashboard/*" element={<DashboardRoutes />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </>
          </Routes>
          <Toaster />
        </EditableContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

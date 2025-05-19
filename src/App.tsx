
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
            {/* Use Route elements to render route components */}
            <Route>
              <Route path="*" element={<PublicRoutes />} />
            </Route>
            <Route>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Route>
            <Route>
              <Route path="/dashboard/*" element={<DashboardRoutes />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </EditableContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

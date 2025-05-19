
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";
import { PublicRoutes } from "@/routes/publicRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { DashboardRoutes } from "@/routes/dashboardRoutes";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <EditableContentProvider>
        <Routes>
          <PublicRoutes />
          <AdminRoutes />
          <DashboardRoutes />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </EditableContentProvider>
    </BrowserRouter>
  );
}

export default App;

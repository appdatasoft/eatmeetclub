
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
            {/* Public routes */}
            <Route path="/*" element={<PublicRoutes />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Dashboard routes - map through the routes object and render each route */}
            {Array.isArray(dashboardRoutes) && 
              dashboardRoutes.map((route, index) => (
                <Route 
                  key={index} 
                  path={route.path} 
                  element={route.element}
                >
                  {route.children?.map((childRoute, childIndex) => (
                    <Route 
                      key={`${index}-${childIndex}`} 
                      path={childRoute.path} 
                      element={childRoute.element} 
                      index={childRoute.index} 
                    />
                  ))}
                </Route>
              ))
            }
            
            {/* Admin Stripe Settings route */}
            <Route path="/admin/stripe-settings" element={<AdminStripeSettings />} />

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

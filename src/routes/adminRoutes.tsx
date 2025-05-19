
import { Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ConfigPage from "@/pages/admin/ConfigPage";
import UsersPage from "@/pages/admin/UsersPage";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminEmails from "@/pages/admin/AdminEmails";
import AdminSMS from "@/pages/admin/AdminSMS";
import AdminVenus from "@/pages/admin/AdminVenus";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminTemplates from "@/pages/admin/AdminTemplates";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminPayment from "@/pages/admin/AdminPayment";
import AdminFees from "@/pages/admin/AdminFees";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const AdminRoutes = () => {
  return (
    <>
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/contracts" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="/admin/contracts/venue" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="/admin/contracts/signup-referral" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="/admin/contracts/ticket-fee" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute adminOnly={true}>
          <AdminOrders />
        </ProtectedRoute>
      } />
      <Route path="/admin/emails" element={
        <ProtectedRoute adminOnly={true}>
          <AdminEmails />
        </ProtectedRoute>
      } />
      <Route path="/admin/sms" element={
        <ProtectedRoute adminOnly={true}>
          <AdminSMS />
        </ProtectedRoute>
      } />
      <Route path="/admin/templates" element={
        <ProtectedRoute adminOnly={true}>
          <AdminTemplates />
        </ProtectedRoute>
      } />
      <Route path="/admin/venus" element={
        <ProtectedRoute adminOnly={true}>
          <AdminVenus />
        </ProtectedRoute>
      } />
      <Route path="/admin/payment" element={
        <ProtectedRoute adminOnly={true}>
          <AdminPayment />
        </ProtectedRoute>
      } />
      <Route path="/admin/fees" element={
        <ProtectedRoute adminOnly={true}>
          <AdminFees />
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute adminOnly={true}>
          <AdminEvents />
        </ProtectedRoute>
      } />
      <Route path="/admin/config" element={
        <ProtectedRoute adminOnly={true}>
          <ConfigPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly={true}>
          <UsersPage />
        </ProtectedRoute>
      } />
    </>
  );
};

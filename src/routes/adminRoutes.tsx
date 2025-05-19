
import { Route, Routes } from "react-router-dom";
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
    <Routes>
      <Route index element={
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="contracts" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="contracts/venue" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="contracts/signup-referral" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="contracts/ticket-fee" element={
        <ProtectedRoute adminOnly={true}>
          <AdminContracts />
        </ProtectedRoute>
      } />
      <Route path="orders" element={
        <ProtectedRoute adminOnly={true}>
          <AdminOrders />
        </ProtectedRoute>
      } />
      <Route path="emails" element={
        <ProtectedRoute adminOnly={true}>
          <AdminEmails />
        </ProtectedRoute>
      } />
      <Route path="sms" element={
        <ProtectedRoute adminOnly={true}>
          <AdminSMS />
        </ProtectedRoute>
      } />
      <Route path="templates" element={
        <ProtectedRoute adminOnly={true}>
          <AdminTemplates />
        </ProtectedRoute>
      } />
      <Route path="venus" element={
        <ProtectedRoute adminOnly={true}>
          <AdminVenus />
        </ProtectedRoute>
      } />
      <Route path="payment" element={
        <ProtectedRoute adminOnly={true}>
          <AdminPayment />
        </ProtectedRoute>
      } />
      <Route path="fees" element={
        <ProtectedRoute adminOnly={true}>
          <AdminFees />
        </ProtectedRoute>
      } />
      <Route path="events" element={
        <ProtectedRoute adminOnly={true}>
          <AdminEvents />
        </ProtectedRoute>
      } />
      <Route path="config" element={
        <ProtectedRoute adminOnly={true}>
          <ConfigPage />
        </ProtectedRoute>
      } />
      <Route path="users" element={
        <ProtectedRoute adminOnly={true}>
          <UsersPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

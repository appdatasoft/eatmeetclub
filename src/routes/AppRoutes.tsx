
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoutes } from './adminRoutes';
import Index from '@/pages/Index';
import Events from '@/pages/Events';
import EventDetails from '@/pages/EventDetails';
import NotFound from '@/pages/NotFound';
import BecomeMember from '@/pages/BecomeMember';
import Dashboard from '@/pages/dashboard/Dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import SetPassword from '@/pages/SetPassword';
import Signup from '@/pages/Signup';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/events" element={<Events />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/become-member" element={<BecomeMember />} />
      
      {/* Auth routes - support multiple path patterns */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/login" element={<Login />} /> {/* Add additional path for login */}
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Dashboard routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

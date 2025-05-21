
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/become-member" element={<BecomeMember />} />

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

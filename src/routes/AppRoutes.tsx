
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoutes } from './adminRoutes';
import { DashboardRoutes } from './dashboardRoutes';
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
import AuthRedirect from '@/components/auth/AuthRedirect';
import RestaurantJoin from '@/pages/restaurants/RestaurantJoin';
import UserProfilePage from '@/pages/UserProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/events" element={<Events />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/become-member" element={<BecomeMember />} />
      <Route path="/restaurants/join" element={<RestaurantJoin />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/profile/:id" element={<UserProfilePage />} />
      
      {/* Auth routes with AuthRedirect for authenticated users */}
      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/auth/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
      <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Dashboard routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardRoutes />
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

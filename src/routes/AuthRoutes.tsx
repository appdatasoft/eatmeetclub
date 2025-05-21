
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import SetPassword from '@/pages/SetPassword';
import NotFound from '@/pages/NotFound';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthRoutes;

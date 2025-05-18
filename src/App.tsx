
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster"

// Import components and pages
import Home from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import EventsManagement from './pages/dashboard/EventsManagement';
import CreateEvent from './pages/dashboard/CreateEvent';
import Memories from './pages/dashboard/Memories';
import CreateMemory from './pages/dashboard/CreateMemory';
import MemoryDetail from './pages/dashboard/MemoryDetail';
import EditMemory from './pages/dashboard/EditMemory';
import AddRestaurant from './pages/dashboard/AddRestaurant';
import RestaurantMenu from './pages/dashboard/RestaurantMenu';
import Settings from './pages/dashboard/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConfigPage from './pages/admin/ConfigPage';
import UsersPage from './pages/admin/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import NotFound from './pages/NotFound';
import EventDetail from './pages/EventDetails';
import TicketSuccess from './pages/TicketSuccess';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import BecomeMember from './BecomeMember';

const queryClient = new QueryClient();

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="eat-meet-theme">
          <div className="app bg-background min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/ticket-success" element={<TicketSuccess />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/become-member" element={<BecomeMember />} />

              {/* Dashboard routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/events" element={<EventsManagement />} />
              <Route path="/dashboard/create-event" element={<CreateEvent />} />
              <Route path="/dashboard/memories" element={<Memories />} />
              <Route path="/dashboard/create-memory" element={<CreateMemory />} />
              <Route path="/dashboard/memory/:id" element={<MemoryDetail />} />
              <Route path="/dashboard/edit-memory/:id" element={<EditMemory />} />
              <Route path="/dashboard/add-restaurant" element={<AddRestaurant />} />
              <Route path="/dashboard/restaurant/:id/menu" element={<RestaurantMenu />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/payments" element={<PaymentsPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/config" element={<ProtectedRoute requiredRole="admin"><ConfigPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

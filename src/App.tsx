
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';

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
import BecomeMember from './pages/BecomeMember';

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/events" element={<ProtectedRoute><EventsManagement /></ProtectedRoute>} />
                <Route path="/dashboard/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                <Route path="/dashboard/memories" element={<ProtectedRoute><Memories /></ProtectedRoute>} />
                <Route path="/dashboard/create-memory" element={<ProtectedRoute><CreateMemory /></ProtectedRoute>} />
                <Route path="/dashboard/memory/:id" element={<ProtectedRoute><MemoryDetail /></ProtectedRoute>} />
                <Route path="/dashboard/edit-memory/:id" element={<ProtectedRoute><EditMemory /></ProtectedRoute>} />
                <Route path="/dashboard/add-restaurant" element={<ProtectedRoute><AddRestaurant /></ProtectedRoute>} />
                <Route path="/dashboard/restaurant/:id/menu" element={<ProtectedRoute><RestaurantMenu /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />

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
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

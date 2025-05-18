
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Optional providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminEditProvider } from './contexts/AdminEditContext';
import { SkinAnalysisProvider } from './contexts/SkinAnalysisContext';
import { HelmetProvider } from 'react-helmet-async';

// Create a client for React Query with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1, // Only retry once to avoid endless loading states
    },
  },
});

// Render the application
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <AdminEditProvider>
              <SkinAnalysisProvider>
                <App />
              </SkinAnalysisProvider>
            </AdminEditProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

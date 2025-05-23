
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "@/components/theme-provider"
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

// Create a single QueryClient instance to prevent multiple instances
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  // Check Supabase connection on initial load
  React.useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      console.log('Supabase connection check:', isConnected ? 'Connected' : 'Failed');
    };
    
    checkConnection();
  }, []);
  
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FeatureFlagProvider>
              <AppRoutes />
            </FeatureFlagProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

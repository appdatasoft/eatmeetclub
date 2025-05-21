
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

const queryClient = new QueryClient()

function App() {
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

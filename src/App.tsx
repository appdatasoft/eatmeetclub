
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "@/components/theme-provider"
import './App.css';
import AuthRoutes from './routes/AuthRoutes';
import AppRoutes from './routes/AppRoutes';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';

const queryClient = new QueryClient()

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  window.addEventListener('online', () => {
    setIsOnline(true);
  });

  window.addEventListener('offline', () => {
    setIsOnline(false);
  });

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FeatureFlagProvider>
              <Routes>
                <Route path="/auth/*" element={<AuthRoutes />} />
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
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

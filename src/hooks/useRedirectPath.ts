
import { useLocation } from 'react-router-dom';

export const useRedirectPath = () => {
  const location = useLocation();
  
  // Extract the redirect path from location state or search params
  return () => {
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    
    // Check location state first (from ProtectedRoute)
    const fromPath = location.state?.from;
    
    // Then check localStorage
    const storedPath = localStorage.getItem('redirectAfterLogin');
    
    // Prioritize: redirect param > location state > localStorage > default
    return redirectParam || fromPath || storedPath || '/dashboard';
  };
};

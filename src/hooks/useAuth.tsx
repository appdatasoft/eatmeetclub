
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  useEffect(() => {
    if (context) {
      console.log('ADMIN_DEBUG: useAuth - isLoggedIn:', !!context.user, 'email:', context.user?.email);
      console.log('ADMIN_DEBUG: useAuth - isAdmin value:', context.isAdmin, 'Type:', typeof context.isAdmin);
      console.log('ADMIN_DEBUG: useAuth - isLoading value:', context.isLoading, 'Type:', typeof context.isLoading);
      
      // Force a re-evaluation of admin status if user is logged in but not admin
      if (context.user && !context.isAdmin) {
        console.log('ADMIN_DEBUG: useAuth - User is logged in but not admin. This may indicate an issue with admin status detection.');
      }
    }
  }, [context?.user, context?.isAdmin]);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;

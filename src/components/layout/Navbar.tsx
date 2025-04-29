
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import NavLinks from './navigation/NavLinks';
import AuthButtons from './navigation/AuthButtons';
import MobileMenuButton from './navigation/MobileMenuButton';
import MobileMenu from './navigation/MobileMenu';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        toast({
          title: "Logout failed",
          description: error.message || "An error occurred while logging out",
          variant: "destructive"
        });
      } else {
        // Only navigate and show success toast if there was no error
        navigate('/');
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account"
        });
      }
    } catch (error: any) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <NavLinks />

          {/* Authentication/User Buttons */}
          <AuthButtons user={user} handleLogout={handleLogout} />

          {/* Mobile menu button */}
          <MobileMenuButton isOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        handleLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;

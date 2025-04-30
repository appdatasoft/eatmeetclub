
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import NavLinks from './navigation/NavLinks';
import AuthButtons from './navigation/AuthButtons';
import MobileMenuButton from './navigation/MobileMenuButton';
import MobileMenu from './navigation/MobileMenu';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, handleLogout } = useAuth();
  const navigate = useNavigate();

  // Log the authentication state to debug
  useEffect(() => {
    console.log('Navbar auth state:', { user, isLoggedIn: !!user });
  }, [user]);

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

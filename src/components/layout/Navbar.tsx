
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import Logo from '@/components/common/Logo';
import NavLinks from '@/components/layout/navigation/NavLinks';
import MobileMenu from '@/components/layout/navigation/MobileMenu';
import MobileMenuButton from '@/components/layout/navigation/MobileMenuButton';
import AuthButtons from '@/components/layout/navigation/AuthButtons';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <Link to="/restaurants/join" className="text-brand-600 hover:text-brand-700 font-medium">
              Register Restaurant
            </Link>
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            isOpen={isMobileMenuOpen} 
            onClick={toggleMobileMenu} 
            className="md:hidden"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </nav>
  );
};

export default Navbar;


import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LogOut } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  handleLogout: () => Promise<void>;
}

const MobileMenu = ({ isOpen, onClose, user, handleLogout }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  const onLogout = async () => {
    try {
      await handleLogout();
      onClose();
    } catch (error) {
      console.error("Mobile logout error:", error);
    }
  };

  return (
    <div className="md:hidden bg-white border-t animate-fade-in">
      <div className="container-custom py-2 space-y-1">
        <Link
          to="/"
          className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
          onClick={onClose}
        >
          Home
        </Link>
        <Link
          to="/events"
          className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
          onClick={onClose}
        >
          Events
        </Link>
        <Link
          to="/how-it-works"
          className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
          onClick={onClose}
        >
          How It Works
        </Link>
        <Link
          to="/about"
          className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
          onClick={onClose}
        >
          About
        </Link>
        <div className="pt-2 pb-3 border-t border-gray-100 flex flex-col space-y-2">
          {user ? (
            <>
              <Button href="/dashboard" variant="ghost" className="justify-center" onClick={onClose}>
                Dashboard
              </Button>
              <Button onClick={onLogout} variant="outline" className="justify-center">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="justify-center" onClick={onClose}>
                Log in
              </Button>
              <Button href="/signup" className="justify-center" onClick={onClose}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

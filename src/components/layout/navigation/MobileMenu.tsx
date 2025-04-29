
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  handleLogout: () => Promise<void>;
}

const MobileMenu = ({ isOpen, onClose, user, handleLogout }: MobileMenuProps) => {
  if (!isOpen) return null;

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
              <Button href="/dashboard" variant="ghost" className="justify-center">
                Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline" className="justify-center">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="justify-center">
                Log in
              </Button>
              <Button href="/signup" className="justify-center">
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


import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  handleLogout: () => Promise<void>;
}

const MobileMenu = ({ isOpen, onClose, user, handleLogout }: MobileMenuProps) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  if (!isOpen) return null;

  const onLogout = async () => {
    try {
      await handleLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      onClose();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link to="/" onClick={onClose} className="text-lg py-2">Home</Link>
          <Link to="/events" onClick={onClose} className="text-lg py-2">Events</Link>
          <Link to="/venues" onClick={onClose} className="text-lg py-2">Venues</Link>
          <Link to="/dashboard/memories" onClick={onClose} className="text-lg py-2">Memories</Link>
          <Link to="/about" onClick={onClose} className="text-lg py-2">About</Link>
          <Link to="/how-it-works" onClick={onClose} className="text-lg py-2">How it Works</Link>
          
          {user ? (
            <>
              <div className="pt-4 border-t border-gray-200">
                <Link to="/dashboard" onClick={onClose} className="text-lg py-2">Dashboard</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={onClose} className="text-lg py-2">Admin</Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={onLogout}
                  className="w-full justify-start p-0 text-lg py-2"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-gray-200">
              <Link to="/login" onClick={onClose} className="text-lg py-2">Login</Link>
              <Link to="/signup" onClick={onClose} className="text-lg py-2">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;

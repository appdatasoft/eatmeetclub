
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthButtonsProps {
  user: any | null;
  handleLogout: () => Promise<void>;
}

const AuthButtons = ({ user, handleLogout }: AuthButtonsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const onLogout = async () => {
    try {
      await handleLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
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
    <div className="hidden md:flex items-center space-x-3">
      {user ? (
        <>
          <Button variant="ghost" size="default" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button onClick={onLogout} variant="outline" size="default">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="default" asChild>
          <Link to="/login">Log in</Link>
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;

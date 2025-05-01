
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
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
          <Button href="/dashboard" variant="ghost" size="md">
            Dashboard
          </Button>
          <Button onClick={onLogout} variant="outline" size="md">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </>
      ) : (
        <Button href="/login" variant="ghost" size="md">
          Log in
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;

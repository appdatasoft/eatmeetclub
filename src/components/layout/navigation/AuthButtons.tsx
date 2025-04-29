
import { Button } from '@/components/common/Button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface AuthButtonsProps {
  user: any | null;
  handleLogout: () => Promise<void>;
}

const AuthButtons = ({ user, handleLogout }: AuthButtonsProps) => {
  const navigate = useNavigate();
  
  const onLogout = async () => {
    try {
      await handleLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
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
        <>
          <Button href="/login" variant="ghost" size="md">
            Log in
          </Button>
          <Button href="/signup" size="md">
            Sign up
          </Button>
        </>
      )}
    </div>
  );
};

export default AuthButtons;

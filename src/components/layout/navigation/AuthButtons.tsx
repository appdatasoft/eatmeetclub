
import { Button } from '@/components/common/Button';
import { LogOut } from 'lucide-react';

interface AuthButtonsProps {
  user: any | null;
  handleLogout: () => Promise<void>;
}

const AuthButtons = ({ user, handleLogout }: AuthButtonsProps) => {
  return (
    <div className="hidden md:flex items-center space-x-3">
      {user ? (
        <>
          <Button href="/dashboard" variant="ghost" size="md">
            Dashboard
          </Button>
          <Button onClick={handleLogout} variant="outline" size="md">
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

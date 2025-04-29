
import { Button } from '@/components/common/Button';

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

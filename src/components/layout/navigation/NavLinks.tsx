
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NavLinks = () => {
  const { user } = useAuth();
  
  return (
    <div className="hidden md:flex items-center space-x-1">
      <Link to="/" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        Home
      </Link>
      <Link to="/events" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        Events
      </Link>
      <Link to="/venues" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        Venues
      </Link>
      <Link to="/how-it-works" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        How It Works
      </Link>
      <Link to="/about" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        About
      </Link>
      {user && (
        <Link to="/dashboard/memories" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
          Memories
        </Link>
      )}
      {!user && (
        <Link to="/signup" className="px-3 py-2 rounded-md text-sm hover:bg-accent font-medium text-brand-500">
          Join Now
        </Link>
      )}
    </div>
  );
};

export default NavLinks;

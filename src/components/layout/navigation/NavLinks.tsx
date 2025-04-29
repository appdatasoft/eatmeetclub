
import { Link } from 'react-router-dom';

const NavLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-1">
      <Link to="/" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        Home
      </Link>
      <Link to="/events" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        Events
      </Link>
      <Link to="/how-it-works" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        How It Works
      </Link>
      <Link to="/about" className="px-3 py-2 rounded-md text-sm hover:bg-accent">
        About
      </Link>
      <Link to="/become-member" className="px-3 py-2 rounded-md text-sm hover:bg-accent font-medium text-brand-500">
        Become a Member
      </Link>
    </div>
  );
};

export default NavLinks;

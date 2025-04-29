
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/common/Button';
import Logo from '@/components/common/Logo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      // Check if user is admin
      if (data.session?.user) {
        checkAdminStatus(data.session.user.id);
      }
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'is_admin',
        { user_id: userId }
      );
      
      if (error) {
        throw error;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
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
          </div>

          {/* Authentication/User Buttons */}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-brand-500 focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t animate-fade-in">
          <div className="container-custom py-2 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
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
      )}
    </nav>
  );
};

export default Navbar;

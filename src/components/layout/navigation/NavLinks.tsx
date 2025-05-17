
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NavLinks = () => {
  const { user, isAdmin } = useAuth();
  
  // Create a custom link component to avoid anchor tag nesting
  const NavItem = ({ to, children }: { to: string, children: React.ReactNode }) => {
    return (
      <NavigationMenuItem>
        <Link to={to}>
          <span className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium",
            "transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            "focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          )}>
            {children}
          </span>
        </Link>
      </NavigationMenuItem>
    );
  };
  
  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList>
          <NavItem to="/">Home</NavItem>
          <NavItem to="/events">Events</NavItem>
          <NavItem to="/venues">Venues</NavItem>
          <NavItem to="/dashboard/memories">Memories</NavItem>
          <NavItem to="/about">About</NavItem>
          {user && (
            <NavItem to="/dashboard">Dashboard</NavItem>
          )}
          {isAdmin && (
            <NavItem to="/admin">Admin</NavItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavLinks;


import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlignJustify, BarChart3, Calendar, CreditCard, FileText, Home, LayoutGrid, Link as LinkIcon, Settings, Utensils, Share2, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: Home,
  },
  {
    name: "Events",
    to: "/dashboard/events",
    icon: Calendar,
  },
  {
    name: "Memories",
    to: "/dashboard/memories",
    icon: FileText,
  },
  {
    name: "Restaurants",
    to: "/dashboard/restaurants/add",
    icon: Utensils,
  },
  {
    name: "Social Media",
    to: "/dashboard/social-media",
    icon: LayoutGrid,
  },
  {
    name: "Affiliate Links",
    to: "/dashboard/affiliate-links",
    icon: Share2,
  },
  {
    name: "Payments",
    to: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    name: "Settings",
    to: "/dashboard/settings",
    icon: Settings,
  },
];

const MobileMenu = () => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.user_metadata?.is_admin;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-muted-foreground px-2 h-9"
          aria-label="Toggle Navigation Menu"
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through your dashboard options.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="mb-4 px-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <nav className="space-y-2 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium hover:bg-secondary/50 px-2 py-1.5",
                  location.pathname === item.to ||
                    (item.to !== "/dashboard" &&
                      location.pathname.startsWith(item.to))
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/dashboard/admin-settings"
                className={cn(
                  "flex items-center rounded-md text-sm font-medium hover:bg-secondary/50 px-2 py-1.5",
                  location.pathname.startsWith("/dashboard/admin-settings")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
        <SheetTitle className="mt-4 text-left px-4">Account</SheetTitle>
        <div className="px-4">
          <button
            onClick={() => handleLogout()}
            className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/80"
          >
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

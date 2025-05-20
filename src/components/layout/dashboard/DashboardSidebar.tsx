
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Landmark,
  LayoutGrid,
  Link as LinkIcon,
  Settings,
  Utensils,
  ShieldCheck,
  Share2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const DashboardSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin;

  const navigation = [
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

  // Only add admin section if user is admin
  if (isAdmin) {
    navigation.push({
      name: "Admin",
      to: "/dashboard/admin-settings",
      icon: ShieldCheck,
    });
  }

  return (
    <div className="w-64 hidden md:flex flex-col border-r h-full bg-background">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-4 flex flex-col flex-1">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm",
                  location.pathname === item.to ||
                    (item.to !== "/dashboard" &&
                      location.pathname.startsWith(item.to))
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;

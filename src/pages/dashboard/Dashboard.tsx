
import { MembershipStatus } from "@/components/dashboard/MembershipStatus";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import UserTickets from "@/components/dashboard/UserTickets";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";

const Dashboard = () => {
  const { isActive } = useMembershipStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="flex flex-col space-y-6">
            <MembershipStatus />
            <QuickActions />
          </div>
          
          {/* Middle column */}
          <div className="md:col-span-2 space-y-6">
            <UpcomingEvents />
            
            {isActive && (
              <UserTickets />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

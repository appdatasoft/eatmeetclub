
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";
import { CalendarCheck, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function MembershipStatus() {
  const { membership, isActive, isLoading } = useMembershipStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
          <CardDescription>Checking your membership...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">No Active Membership</CardTitle>
          <CardDescription>You don't have a membership yet</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Join our community and get access to exclusive events
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/become-member">Become a Member</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={isActive ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          {isActive ? (
            <>
              <CalendarCheck className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-800">Active Membership</span>
            </>
          ) : (
            <>
              <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Expired Membership</span>
            </>
          )}
        </CardTitle>
        <CardDescription className={isActive ? "text-green-700" : "text-amber-700"}>
          {isActive ? "Your membership is active" : "Your membership has expired"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {membership.started_at && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">
              {format(new Date(membership.started_at), "MMM d, yyyy")}
            </span>
          </div>
        )}
        {membership.renewal_at && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Renewal:</span>
            <span className="font-medium">
              {format(new Date(membership.renewal_at), "MMM d, yyyy")}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">
            {membership.is_subscription ? "Monthly Subscription" : "One-time Payment"}
          </span>
        </div>
      </CardContent>
      {!isActive && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/become-member">Renew Membership</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

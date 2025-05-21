
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";
import { CalendarCheck, Calendar, AlertCircle, Building } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function MembershipStatus() {
  const { restaurantMemberships, isLoading } = useMembershipStatus();
  const [productInfo, setProductInfo] = useState<{ name?: string; description?: string } | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Restaurant Memberships</CardTitle>
          <CardDescription>Checking your memberships...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!restaurantMemberships || restaurantMemberships.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">No Restaurant Memberships</CardTitle>
          <CardDescription>You don't have any active restaurant memberships</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <Building className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Purchase a membership for your restaurant to publish events
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/become-member">Get Restaurant Membership</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Restaurant Memberships</h3>
      
      {restaurantMemberships.map((membership) => (
        <Card 
          key={membership.id}
          className="border-green-200 bg-green-50"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <CalendarCheck className="mr-2 h-4 w-4 text-green-600" />
                <span className="text-green-800">Active Membership</span>
              </CardTitle>
              <Badge variant="outline" className="bg-white">
                {membership.restaurant?.name || "Restaurant"}
              </Badge>
            </div>
            <CardDescription className="text-green-700">
              Your membership is active for this restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {membership.product && (
              <div className="bg-white p-3 rounded-md mb-3">
                <h4 className="font-medium text-sm">{membership.product.name || "Membership Plan"}</h4>
                {membership.product.description && (
                  <p className="text-xs text-gray-600 mt-1">{membership.product.description}</p>
                )}
              </div>
            )}
            
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
        </Card>
      ))}
      
      <CardFooter className="px-0 pt-4">
        <Button asChild className="w-full">
          <Link to="/become-member">Add Another Restaurant Membership</Link>
        </Button>
      </CardFooter>
    </div>
  );
}

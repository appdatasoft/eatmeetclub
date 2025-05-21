import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MembershipSteps from "@/components/membership/MembershipSteps";
import StripeModeNotification from "@/components/membership/StripeModeNotification";
import { useStripeMode } from "@/hooks/membership/useStripeMode";
import { MembershipFormValues } from "@/lib/schemas/membership";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MembershipPageContentProps {
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  isLoading: boolean;
}

interface Restaurant {
  id: string;
  name: string;
}

const MembershipPageContent: React.FC<MembershipPageContentProps> = ({ onSubmit, isLoading }) => {
  // Use our hook for Stripe mode checking
  const { isStripeTestMode, stripeCheckError, handleRetryStripeCheck } = useStripeMode();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Fetch user's restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        setRestaurants(data || []);
        
        // Select first restaurant by default if available
        if (data && data.length > 0) {
          setSelectedRestaurantId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Wrapper for onSubmit to include restaurant ID
  const handleSubmit = async (values: MembershipFormValues) => {
    if (!selectedRestaurantId) {
      // Handle error - restaurant selection required
      return;
    }
    
    // Add restaurant ID to values
    const enrichedValues = {
      ...values,
      restaurantId: selectedRestaurantId
    };
    
    await onSubmit(enrichedValues);
  };

  return (
    <div className="container-custom">
      {/* Display improved Stripe mode notification */}
      <StripeModeNotification 
        isStripeTestMode={isStripeTestMode === true}
        stripeCheckError={stripeCheckError}
        onRetry={handleRetryStripeCheck}
      />
      
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="bg-brand-500 text-white">
            <CardTitle className="text-2xl">Restaurant Membership</CardTitle>
            <CardDescription className="text-white/90">
              Purchase a membership to enable publishing events for your restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {restaurants.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-select">Select Restaurant</Label>
                  <Select
                    value={selectedRestaurantId}
                    onValueChange={setSelectedRestaurantId}
                    disabled={loadingRestaurants}
                  >
                    <SelectTrigger id="restaurant-select" className="w-full">
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the restaurant you want to purchase a membership for
                  </p>
                </div>
                
                <MembershipSteps 
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            ) : loadingRestaurants ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No Restaurants Found</h3>
                <p className="text-muted-foreground mb-4">
                  You need to add a restaurant before purchasing a membership
                </p>
                <Button asChild>
                  <Link to="/dashboard/add-restaurant">Add Restaurant</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembershipPageContent;

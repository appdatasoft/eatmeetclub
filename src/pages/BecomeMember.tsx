import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

const BecomeMember = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleProceedToPayment = () => {
    setIsRedirecting(true);
    toast({
      title: "Redirecting to payment",
      description: "Taking you to the membership payment page",
    });
    
    // Short delay to show the toast before redirecting
    setTimeout(() => {
      navigate("/membership-payment");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="container-custom max-w-5xl py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Become a Member</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our exclusive community and enjoy special access to dining events, 
            restaurant experiences, and connect with fellow food enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-primary/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Monthly Membership
                <Badge className="bg-primary text-white">Popular</Badge>
              </CardTitle>
              <CardDescription>Recurring monthly subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-3xl font-bold">$25<span className="text-lg text-gray-500 font-normal">/month</span></p>
              </div>
              <ul className="space-y-2">
                {[
                  "Access to all exclusive dining events",
                  "Priority booking on popular events",
                  "Member-only pricing on tickets",
                  "Cancel anytime"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleProceedToPayment}
                disabled={isRedirecting}
              >
                {isRedirecting ? "Redirecting..." : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Annual Membership</CardTitle>
              <CardDescription>Coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-3xl font-bold">$240<span className="text-lg text-gray-500 font-normal">/year</span></p>
                <p className="text-sm text-green-600 font-medium">Save $60 compared to monthly</p>
              </div>
              <ul className="space-y-2">
                {[
                  "All features of monthly membership",
                  "Two free event tickets per year",
                  "Exclusive annual member gathering",
                  "Annual loyalty rewards"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Star className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Exclusive Access</h3>
              <p className="text-gray-600">Get priority access to all our dining events before they're open to the public.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Member Pricing</h3>
              <p className="text-gray-600">Enjoy special member pricing on event tickets and restaurant partnerships.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Community</h3>
              <p className="text-gray-600">Connect with a community of food enthusiasts who share your passion.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BecomeMember;


import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchStripeMode } from "@/utils/stripeApi";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, LucideCreditCard } from "lucide-react";

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState("connect");
  
  const { data: stripeMode } = useQuery({
    queryKey: ["stripeMode"],
    queryFn: fetchStripeMode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleConnectStripe = async () => {
    // This would redirect to Stripe Connect onboarding
    // For now, we'll just show a notification
    window.open("https://dashboard.stripe.com/connect/accounts/overview", "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        
        {stripeMode?.mode === "test" && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              You are in Stripe Test Mode. No real payments will be processed.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="connect">Connect Stripe</TabsTrigger>
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Stripe Account</CardTitle>
                <CardDescription>
                  Connect your Stripe account to receive payments from ticket sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">How Payments Work</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Ticket payments are held in Stripe until the event is completed</li>
                    <li>• Service fee is deposited in the app's admin account</li>
                    <li>• Taxes are deposited to your account</li>
                    <li>• Commission fee is sent to the app admin</li>
                    <li>• Remaining ticket revenue is deposited to your account</li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    onClick={handleConnectStripe} 
                    className="flex items-center"
                  >
                    <LucideCreditCard className="mr-2 h-4 w-4" />
                    Connect Stripe Account
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    <p>Don't have a Stripe account?{" "}
                      <a 
                        href="https://dashboard.stripe.com/register" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center"
                      >
                        Create one now 
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
                <CardDescription>
                  Understanding how ticket payments are distributed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <h4 className="font-medium text-sm text-green-800 mb-1">Your Revenue</h4>
                      <p className="text-xs text-green-700">
                        Base ticket price (minus commission) + applicable taxes
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="font-medium text-sm text-blue-800 mb-1">Service Fee</h4>
                      <p className="text-xs text-blue-700">
                        Added to ticket price, collected by platform
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                      <h4 className="font-medium text-sm text-purple-800 mb-1">Commission</h4>
                      <p className="text-xs text-purple-700">
                        Percentage of base ticket price, retained by platform
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    For exact rate information, please check the{" "}
                    <Link to="/dashboard/settings" className="text-primary hover:underline">
                      current fees
                    </Link>{" "}
                    in the settings section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Overview</CardTitle>
                <CardDescription>
                  View your payment history and upcoming payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Connect your Stripe account to view payment details
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("connect")}
                    className="mt-4"
                  >
                    Connect Stripe Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;

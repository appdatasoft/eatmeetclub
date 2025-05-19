
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Settings, AlertTriangle, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminPayment = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connect");

  // Fetch the current Stripe mode
  const { data: stripeMode } = useQuery({
    queryKey: ["stripeMode"],
    queryFn: async () => {
      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const url = `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/check-stripe-mode?_=${timestamp}`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          },
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`Error fetching Stripe mode: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching Stripe mode:", error);
        return { mode: "test", error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to connect your Stripe account",
          variant: "destructive",
        });
        return;
      }
      
      // Call the create-stripe-connect edge function
      const response = await supabase.functions.invoke('create-stripe-connect', {
        body: {
          accountType: 'standard', // or 'express' based on your requirements
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to create Stripe Connect link");
      }
      
      if (response.data?.url) {
        // Redirect to the Stripe Connect onboarding URL
        window.open(response.data.url, '_blank');
        
        toast({
          title: "Stripe Connect Initiated",
          description: "Complete the process in the new tab to connect your Stripe account",
        });
      } else {
        throw new Error("No URL returned from Stripe Connect");
      }
    } catch (error) {
      console.error("Stripe Connect error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Payment Management</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
            className="flex items-center gap-1"
          >
            Stripe Dashboard <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        
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
            <TabsTrigger value="connect">Stripe Connect</TabsTrigger>
            <TabsTrigger value="settings">Payment Settings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stripe Connect Integration</CardTitle>
                <CardDescription>
                  Connect your platform to Stripe to manage payments and payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium text-lg mb-2">How Stripe Connect Works</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Users can connect their Stripe accounts to receive payments</li>
                    <li>• Platform collects service fees from transactions</li>
                    <li>• Revenue is split according to your fee structure</li>
                    <li>• Automatic transfers to connected Stripe accounts</li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    onClick={handleConnectStripe} 
                    disabled={isConnecting}
                    className="flex items-center"
                  >
                    {isConnecting ? (
                      <>Connecting...</>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Connect Stripe Account
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Connect your platform's Stripe account to enable payment processing for your users.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Flow Configuration</CardTitle>
                <CardDescription>
                  Configure how payments are processed and distributed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <h4 className="font-medium text-sm text-green-800 mb-1">Ticket Payments Flow</h4>
                      <p className="text-xs text-green-700">
                        Event ticket revenue splits between event owners and referrers, with platform fees deducted automatically.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="font-medium text-sm text-blue-800 mb-1">Venue Subscription Flow</h4>
                      <p className="text-xs text-blue-700">
                        Monthly venue subscription fees with referral commissions for users who sign up venues.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure platform fees, referral commissions, and payout schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Ticket Referral Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">5%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Paid to users who refer ticket buyers
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Sales Referral Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">10%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Paid to users who sign up venues
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Platform Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">2.9% + $0.30</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Per transaction fee collected by platform
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Fee Structure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all payment transactions and payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Transactions will appear here once payments start processing
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPayment;

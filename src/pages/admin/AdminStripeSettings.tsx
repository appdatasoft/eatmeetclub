
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import StripeSettingsPanel from '@/components/admin/settings/StripeSettingsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminStripeSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Payment Settings</h1>
        
        <Tabs defaultValue="stripe" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stripe">Stripe Settings</TabsTrigger>
            <TabsTrigger value="fees">Service Fees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe" className="space-y-4">
            <StripeSettingsPanel />
            
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your Stripe API keys and webhook endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Stripe Dashboard</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage your Stripe account, view transactions, and access detailed reports
                    </p>
                    <a 
                      href="https://dashboard.stripe.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Open Stripe Dashboard
                    </a>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium">API Keys</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      To update your Stripe API keys, please visit the Supabase dashboard
                    </p>
                    <a 
                      href={`https://supabase.com/dashboard/project/wocfwpedauuhlrfugxuu/settings/functions`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Manage API Keys
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Service Fees</CardTitle>
                <CardDescription>
                  Configure the fees charged for transactions and memberships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Fee settings will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminStripeSettings;

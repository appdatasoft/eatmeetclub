
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { FileText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminContracts = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine which contract type to display based on the URL
  let defaultTab = "all";
  if (path.includes("/venue")) {
    defaultTab = "venue";
  } else if (path.includes("/signup-referral")) {
    defaultTab = "signup";
  } else if (path.includes("/ticket-fee")) {
    defaultTab = "ticket";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Contracts Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Contract Templates</CardTitle>
            <CardDescription>
              Manage and customize contract templates for different purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Contracts</TabsTrigger>
                <TabsTrigger value="venue">Venue Contracts</TabsTrigger>
                <TabsTrigger value="signup">Signup Referral Fee</TabsTrigger>
                <TabsTrigger value="ticket">Ticket Fee</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <p className="text-gray-600">
                  All contract templates are listed here. Select a specific tab to filter by contract type.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Contract management interface will be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="venue" className="space-y-4">
                <p className="text-gray-600">
                  Venue contract templates used for restaurant partnerships.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Venue contract template editor will be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <p className="text-gray-600">
                  Signup referral fee contract templates for partnership agreements.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Signup referral fee contract template editor will be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="ticket" className="space-y-4">
                <p className="text-gray-600">
                  Ticket fee contract templates for event payments and commission structures.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Ticket fee contract template editor will be implemented here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContracts;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Template } from "lucide-react";

const AdminTemplates = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Template className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Templates Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Communication Templates</CardTitle>
            <CardDescription>
              Manage templates used across the platform for communications and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="email">Email Templates</TabsTrigger>
                <TabsTrigger value="sms">SMS Templates</TabsTrigger>
                <TabsTrigger value="contracts">Contract Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <p className="text-gray-600">
                  Email templates used for automated communications with users, restaurants, and partners.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Email template editor will be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="space-y-4">
                <p className="text-gray-600">
                  SMS templates for notifications and alerts sent to users.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">SMS template editor will be implemented here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="contracts" className="space-y-4">
                <p className="text-gray-600">
                  Contract templates for restaurant partnerships and user agreements.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Contract template editor will be implemented here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTemplates;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Mail } from "lucide-react";

const AdminEmails = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Mail className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Email Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Manage system email templates and communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Email management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEmails;

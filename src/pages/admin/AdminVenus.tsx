
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Planet } from "lucide-react";

const AdminVenus = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Planet className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Venus Platform</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Venus Management</CardTitle>
            <CardDescription>
              Configure and manage Venus platform settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Venus platform management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminVenus;

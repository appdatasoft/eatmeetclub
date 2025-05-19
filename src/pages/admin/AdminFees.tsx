
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { DollarSign } from "lucide-react";

const AdminFees = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Fee Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
            <CardDescription>
              Configure platform fees, service charges, and commission rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This section will allow you to manage all fee-related configurations for the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFees;

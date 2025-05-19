
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { FileText } from "lucide-react";

const AdminContracts = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Contracts Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Contracts</CardTitle>
            <CardDescription>
              Manage and review all restaurant partnership contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Contract management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContracts;

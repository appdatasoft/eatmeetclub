
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { CreditCard } from "lucide-react";

const AdminPayment = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Payment Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
            <CardDescription>
              Manage payment settings and transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This section will display payment transactions and settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayment;

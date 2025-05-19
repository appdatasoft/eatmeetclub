
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { ShoppingCart } from "lucide-react";

const AdminOrders = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Orders Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>
              Manage all customer orders and reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This section will display all customer orders with filtering and sorting options.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

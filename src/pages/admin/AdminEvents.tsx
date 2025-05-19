
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Calendar } from "lucide-react";

const AdminEvents = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Events Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Manage and moderate all platform events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Event management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;

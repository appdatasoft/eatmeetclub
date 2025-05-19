
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { DollarSign, RefreshCw } from "lucide-react";
import { useAdminFees } from "@/hooks/admin/useAdminFees";
import FeeCard from "@/components/admin/fees/FeeCard";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import RetryAlert from "@/components/ui/RetryAlert";
import { useState } from "react";

const AdminFees = () => {
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    fees, 
    isLoading, 
    error, 
    isEditing, 
    setIsEditing, 
    handleSave, 
    isSaving 
  } = useAdminFees();

  const handleEdit = (key: string) => {
    setIsEditing(key);
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const handleSaveFee = (key: string, value: number, type?: 'flat' | 'percentage') => {
    handleSave(key, value);
    if (type) {
      handleSave(`${key.replace('_value', '')}_type`, type);
    }
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['adminFees'] });
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Fee Management</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Fee Management</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <RetryAlert
                title="Error Loading Fee Configuration"
                message="Unable to load the fee configuration. This could be due to a database connection issue or missing configuration."
                onRetry={handleRetry}
                isRetrying={isRetrying}
                severity="error"
              />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold">Fee Management</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
            <CardDescription>
              Configure platform fees, service charges, and commission rates
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fees && (
            <>
              <FeeCard
                title="Restaurant Monthly Fee"
                description="The monthly fee charged to restaurants"
                value={fees.restaurant_monthly_fee}
                isEditing={isEditing === 'restaurant_monthly_fee'}
                isLoading={isSaving}
                onEdit={() => handleEdit('restaurant_monthly_fee')}
                onSave={(value) => handleSaveFee('restaurant_monthly_fee', value)}
                onCancel={handleCancel}
              />

              <FeeCard
                title="Sales Commission"
                description="Commission for signing up venues"
                value={fees.signup_commission_value}
                type={fees.signup_commission_type}
                hasTypeOption={true}
                isEditing={isEditing === 'signup_commission_value'}
                isLoading={isSaving}
                onEdit={() => handleEdit('signup_commission_value')}
                onSave={(value, type) => handleSaveFee('signup_commission_value', value, type)}
                onCancel={handleCancel}
              />

              <FeeCard
                title="Ticket Sales Commission"
                description="Commission on ticket sales"
                value={fees.ticket_commission_value}
                type={fees.ticket_commission_type}
                hasTypeOption={true}
                isEditing={isEditing === 'ticket_commission_value'}
                isLoading={isSaving}
                onEdit={() => handleEdit('ticket_commission_value')}
                onSave={(value, type) => handleSaveFee('ticket_commission_value', value, type)}
                onCancel={handleCancel}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFees;


import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const MenuLoadingState: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    </DashboardLayout>
  );
};

export default MenuLoadingState;

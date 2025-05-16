
import React from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface MenuErrorStateProps {
  title: string;
  description: string;
  onBack: () => void;
}

const MenuErrorState: React.FC<MenuErrorStateProps> = ({ title, description, onBack }) => {
  return (
    <DashboardLayout>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
        <Button onClick={onBack} className="mt-4">
          Go back
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default MenuErrorState;

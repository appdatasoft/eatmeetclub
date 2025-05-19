
import { ReactNode } from 'react';

interface DashboardContentProps {
  children: ReactNode;
}

const DashboardContent = ({ children }: DashboardContentProps) => {
  return (
    <div className="md:col-span-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardContent;

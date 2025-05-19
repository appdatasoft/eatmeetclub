
import React, { ReactNode } from 'react';

interface AdminContentProps {
  children: ReactNode;
}

const AdminContent = ({ children }: AdminContentProps) => {
  return (
    <div className="md:col-span-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminContent;

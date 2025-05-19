
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import SocialMediaTab from '@/components/dashboard/social/SocialMediaTab';

const AdminSocialMedia = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Social Media Management</h1>
        <SocialMediaTab isAdmin={true} />
      </div>
    </AdminLayout>
  );
};

export default AdminSocialMedia;

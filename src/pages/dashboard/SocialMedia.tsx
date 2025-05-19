
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SocialMediaTab from '@/components/dashboard/social/SocialMediaTab';

const SocialMedia = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Social Media</h1>
        <SocialMediaTab />
      </div>
    </DashboardLayout>
  );
};

export default SocialMedia;

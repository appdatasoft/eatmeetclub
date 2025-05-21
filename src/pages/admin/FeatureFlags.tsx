
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FeatureFlagManager } from '@/components/admin/FeatureFlagManager';

const FeatureFlags = () => {
  return (
    <AdminLayout>
      <FeatureFlagManager />
    </AdminLayout>
  );
};

export default FeatureFlags;

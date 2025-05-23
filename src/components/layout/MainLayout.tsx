
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Move isAdmin to the top - highest priority
  const { isAdmin } = useAuth();
  const { canEdit } = useEditableContent();
  const [showEditToggle, setShowEditToggle] = useState(false);
  const [permissionLoaded, setPermissionLoaded] = useState(false);

  // Always prioritize isAdmin status for edit toggle
  useEffect(() => {
    console.log('[MainLayout] Admin & Edit status:');
    console.log('[MainLayout] isAdmin:', isAdmin);
    console.log('[MainLayout] canEdit from context:', canEdit);
    
    // Always prioritize isAdmin status first - if admin, always show toggle
    // Use === true for explicit check
    const shouldShow = isAdmin === true || canEdit === true;
    setShowEditToggle(shouldShow);
    
    // Set permission as loaded after the first check is complete
    if (!permissionLoaded && isAdmin !== undefined) {
      setPermissionLoaded(true);
    }
    
    console.log('[MainLayout] showEditToggle updated to:', shouldShow);
    console.log('[MainLayout] permissionLoaded updated to:', permissionLoaded);
  }, [canEdit, isAdmin, permissionLoaded]);

  console.log('[MainLayout] About to render, showEditToggle:', showEditToggle, 'canEdit:', canEdit, 'isAdmin:', isAdmin);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Debug banner when permissions are inconsistent */}
      {isAdmin === true && canEdit !== true && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          Admin detected, but canEdit is FALSE. Admin permissions may be delayed in loading.
        </div>
      )}
      
      {showEditToggle && <EditModeToggle />}
      
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

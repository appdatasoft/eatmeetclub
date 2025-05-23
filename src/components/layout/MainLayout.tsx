
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
  const { isAdmin } = useAuth();
  const { canEdit } = useEditableContent();
  const [showEditToggle, setShowEditToggle] = useState(false);

  useEffect(() => {
    console.log('[MainLayout] Admin & Edit status:');
    console.log('[MainLayout] isAdmin:', isAdmin);
    console.log('[MainLayout] canEdit from context:', canEdit);
    
    // FIXED: Use a direct assignment - if admin or canEdit is true, show toggle
    const shouldShow = isAdmin === true || canEdit === true;
    setShowEditToggle(shouldShow);
    console.log('[MainLayout] showEditToggle updated to:', shouldShow);
  }, [canEdit, isAdmin]);

  console.log('[MainLayout] About to render, showEditToggle:', showEditToggle, 'canEdit:', canEdit, 'isAdmin:', isAdmin);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Admin diagnostic banner */}
      {isAdmin === true && canEdit !== true && (
        <div style={{ background: 'red', color: 'white', padding: 8, textAlign: 'center', fontSize: '14px' }}>
          Admin detected, but canEdit is FALSE. Check permissions in EditableContentProvider.
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

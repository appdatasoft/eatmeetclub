
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { canEdit } = useEditableContent();
  const [showEditToggle, setShowEditToggle] = useState(false);

  useEffect(() => {
    console.log('[MainLayout] canEdit status received:', canEdit, 'Type:', typeof canEdit);
    
    // Update showEditToggle immediately when canEdit changes
    setShowEditToggle(canEdit === true);
    console.log('[MainLayout] showEditToggle updated to:', canEdit === true);
  }, [canEdit]);

  console.log('[MainLayout] About to render, showEditToggle:', showEditToggle, 'canEdit:', canEdit);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showEditToggle && (
        <>
          <div style={{ border: '2px solid red', padding: '4px', fontSize: '12px' }}>
            DEBUG: EditModeToggle should be visible (showEditToggle: {showEditToggle.toString()}, canEdit: {canEdit?.toString()})
          </div>
          <EditModeToggle />
        </>
      )}
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

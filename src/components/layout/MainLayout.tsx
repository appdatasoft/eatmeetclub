
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
    console.log('[MainLayout] canEdit status:', canEdit, 'Type:', typeof canEdit);
    
    // Use a small delay to ensure we have the latest canEdit value
    // This is necessary because canEdit might change after initial render
    const timer = setTimeout(() => {
      setShowEditToggle(canEdit === true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [canEdit]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showEditToggle && <EditModeToggle />}
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

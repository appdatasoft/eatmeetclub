
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { canEdit } = useEditableContent();
  
  useEffect(() => {
    console.log('ADMIN_DEBUG: MainLayout - canEdit:', canEdit);
  }, [canEdit]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {canEdit ? (
        <EditModeToggle />
      ) : (
        console.log('ADMIN_DEBUG: MainLayout not showing EditModeToggle - canEdit is false')
      )}
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

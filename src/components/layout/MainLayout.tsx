
import React, { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { canEdit } = useEditableContent();

  useEffect(() => {
    console.log('[MainLayout] canEdit status:', canEdit);
  }, [canEdit]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Fix: Use proper conditional rendering without console.log in JSX */}
      {canEdit && <EditModeToggle />}

      <main className="flex-grow bg-white">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

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

      {/* ✅ Only render toggle if user can edit */}
      {canEdit && (
        <div className="relative z-50 w-full bg-gray-50 border-b border-gray-200">
          <EditModeToggle />
        </div>
      )}

      <main className="flex-grow bg-white">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

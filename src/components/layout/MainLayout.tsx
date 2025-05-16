
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { canEdit } = useEditableContent();
  
  return (
    <>
      <Navbar />
      {canEdit && <EditModeToggle />}
      <main className="min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;

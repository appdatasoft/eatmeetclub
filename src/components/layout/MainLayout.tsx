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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ✅ Show edit mode toggle bar if user can edit */}
      {canEdit && (
        <div className="relative z-50 w-full bg-gray-50 border-b border-gray-200">
          <EditModeToggle />
        </div>
      )}

      {/* 🧪 Debugging visibility of canEdit */}
      {/* <pre className="text-sm bg-yellow-100 px-4 py-2">{JSON.stringify({ canEdit }, null, 2)}</pre> */}

      <main className="flex-grow bg-white">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

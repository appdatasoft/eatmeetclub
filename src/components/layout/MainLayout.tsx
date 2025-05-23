
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EditModeToggle from '@/components/editor/EditModeToggle';
import { useEditableContent } from '@/components/editor/EditableContentProvider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Move isAdmin to the top - highest priority
  const { isAdmin, user } = useAuth();
  const { canEdit } = useEditableContent();
  const [showEditToggle, setShowEditToggle] = useState(false);
  const [permissionLoaded, setPermissionLoaded] = useState(false);
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);

  // Perform immediate admin check independent of other systems
  useEffect(() => {
    const checkAdminDirectly = async () => {
      if (user && !permissionLoaded) {
        try {
          console.log('[MainLayout] Performing direct admin check for:', user.email);
          const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin', { 
            user_id: user.id 
          });
          
          if (rpcError) {
            console.error('[MainLayout] Direct admin check error:', rpcError);
          } else {
            console.log('[MainLayout] Direct admin check result:', rpcResult);
            setDirectAdminCheck(rpcResult === true);
            
            // If admin is confirmed, always show edit toggle
            if (rpcResult === true) {
              setShowEditToggle(true);
              setPermissionLoaded(true);
            }
          }
        } catch (error) {
          console.error('[MainLayout] Error in direct admin check:', error);
        }
      }
    };

    checkAdminDirectly();
  }, [user, permissionLoaded]);

  // Always prioritize isAdmin status for edit toggle
  useEffect(() => {
    console.log('[MainLayout] Admin & Edit status:');
    console.log('[MainLayout] isAdmin:', isAdmin);
    console.log('[MainLayout] canEdit from context:', canEdit);
    console.log('[MainLayout] directAdminCheck:', directAdminCheck);
    
    // Always prioritize admin status - check multiple sources
    const effectiveAdmin = isAdmin === true || directAdminCheck === true;
    const shouldShow = effectiveAdmin || canEdit === true;
    setShowEditToggle(shouldShow);
    
    // Set permission as loaded if we have definitive admin information
    if (!permissionLoaded && (isAdmin !== undefined || directAdminCheck !== null)) {
      setPermissionLoaded(true);
    }
    
    console.log('[MainLayout] showEditToggle updated to:', shouldShow);
    console.log('[MainLayout] permissionLoaded updated to:', permissionLoaded);
  }, [canEdit, isAdmin, permissionLoaded, directAdminCheck]);

  // Determine effective admin status from all sources
  const effectiveAdmin = isAdmin === true || directAdminCheck === true;
  
  console.log('[MainLayout] About to render, showEditToggle:', showEditToggle, 'canEdit:', canEdit, 'isAdmin:', isAdmin, 'directAdminCheck:', directAdminCheck);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Debug banner when permissions are inconsistent */}
      {effectiveAdmin === true && canEdit !== true && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          Admin detected, but canEdit is FALSE. Admin permissions may be delayed in loading.
        </div>
      )}
      
      {/* Always show EditModeToggle for admins, even if canEdit is false */}
      {(showEditToggle || effectiveAdmin) && <EditModeToggle />}
      
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

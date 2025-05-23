import React, { useEffect, useState } from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Pencil, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const EditModeToggle = () => {
  // Move isAdmin check to the TOP - highest priority
  const { isAdmin, user } = useAuth();
  const { canEdit, editModeEnabled, toggleEditMode, setEditModeEnabled } = useEditableContent();
  const [adminChecked, setAdminChecked] = useState<boolean>(false);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [localEditMode, setLocalEditMode] = useState<boolean>(false);
  
  // Immediate admin check when component mounts
  useEffect(() => {
    console.log('ADMIN_DEBUG: EditModeToggle component mounting');
    console.log('ADMIN_DEBUG: EditModeToggle component - isAdmin:', isAdmin);
    console.log('ADMIN_DEBUG: EditModeToggle component - canEdit:', canEdit);
    console.log('ADMIN_DEBUG: EditModeToggle component - editModeEnabled:', editModeEnabled);
    
    // Sync local state with provider state
    setLocalEditMode(editModeEnabled);
    
    // Perform immediate admin check if user exists but admin status is uncertain
    const checkAdminStatus = async () => {
      if (user && !adminChecked) {
        try {
          console.log('ADMIN_DEBUG: EditModeToggle - Performing direct admin check for user:', user.email);
          const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin', { 
            user_id: user.id 
          });
          
          if (rpcError) {
            console.error('ADMIN_DEBUG: EditModeToggle - RPC admin check error:', rpcError);
          } else {
            console.log('ADMIN_DEBUG: EditModeToggle - Direct RPC admin check result:', rpcResult);
            setAdminStatus(rpcResult === true);
          }
        } catch (error) {
          console.error('ADMIN_DEBUG: EditModeToggle - Error in direct admin check:', error);
        } finally {
          setAdminChecked(true);
        }
      }
    };
    
    checkAdminStatus();
  }, [user, canEdit, editModeEnabled, isAdmin, adminChecked]);

  // Keep local edit mode in sync with provider
  useEffect(() => {
    setLocalEditMode(editModeEnabled);
  }, [editModeEnabled]);

  // Enhanced click handler with more logging
  const handleToggleClick = () => {
    console.log('ADMIN_DEBUG: Toggle edit mode button clicked');
    console.log('ADMIN_DEBUG: Before toggle - isAdmin:', isAdmin, 'canEdit:', canEdit, 'editModeEnabled:', editModeEnabled);
    
    // Toggle local state immediately for better UX feedback
    const newEditMode = !localEditMode;
    setLocalEditMode(newEditMode);
    
    // Call provider toggle function
    toggleEditMode();
    
    // Show success toast for admin activation
    const effectiveAdmin = isAdmin === true || adminStatus === true;
    if (effectiveAdmin) {
      if (newEditMode) {
        toast.success('Admin edit permissions activated');
      } else {
        toast.success('Edit mode disabled');
      }
    }
  };

  // Determine if we should show the admin mode
  const effectiveAdmin = isAdmin === true || adminStatus === true;
  
  // Show the permissions debug banner if there's an inconsistency
  if (effectiveAdmin && canEdit !== true) {
    console.log('ADMIN_DEBUG: Inconsistent permissions detected - admin is true but canEdit is false');
    return (
      <div className="w-full bg-yellow-50 py-2 border-b border-yellow-200 sticky top-0 z-50 shadow-sm">
        <div className="container-custom flex justify-between items-center">
          <span className="flex items-center gap-2 text-yellow-700 font-medium">
            <AlertCircle size={16} />
            Admin detected but edit permissions are not active. Trying to resolve...
          </span>
          <button
            onClick={handleToggleClick}
            className="px-6 py-2 rounded-full bg-yellow-200 text-yellow-800 border border-yellow-300 hover:bg-yellow-300"
            data-testid="edit-mode-toggle"
          >
            Try Enabling Edit Mode
          </button>
        </div>
      </div>
    );
  }
  
  // ALWAYS allow rendering for admins, regardless of canEdit state
  if (!effectiveAdmin && !canEdit) {
    console.log('ADMIN_DEBUG: EditModeToggle not rendering content - no edit permissions');
    return null;
  }

  console.log('ADMIN_DEBUG: EditModeToggle IS RENDERING - has edit permissions');
  console.log('ADMIN_DEBUG: Current edit mode state:', localEditMode ? 'ENABLED' : 'DISABLED');
  
  return (
    <div className="w-full bg-gray-50 py-2 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-custom flex justify-between items-center">
        <span className="text-gray-700 font-medium">Admin Tools:</span>
        <button
          onClick={handleToggleClick}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-full transition-all
            ${localEditMode 
              ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200" 
              : "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"}
          `}
          data-testid="edit-mode-toggle"
        >
          {localEditMode ? (
            <>
              <Eye className="h-4 w-4" />
              Exit Edit Mode
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit Mode
            </>
          )}
        </button>
      </div>
      {localEditMode && (
        <div className="w-full bg-amber-50 py-1 text-center text-amber-700 text-sm border-b border-amber-200">
          Edit Mode Active - Click on elements to edit them
        </div>
      )}
    </div>
  );
};

export default EditModeToggle;

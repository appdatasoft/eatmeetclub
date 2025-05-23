
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInlineEdit, EditableContent } from '@/hooks/useInlineEdit';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EditableContextType {
  contentMap: Record<string, EditableContent>;
  canEdit: boolean;
  editModeEnabled: boolean;
  setEditModeEnabled: (value: boolean) => void;
  saveContent: (id: string, content: string, contentType?: string) => Promise<boolean>;
  isLoading: boolean;
  fetchPageContent: () => Promise<void>;
  isEditing: string | null;
  handleEdit: (id: string) => void;
  handleSave: (content: EditableContent) => Promise<boolean>;
  handleCancel: () => void;
  toggleEditMode: () => void;
  checkAdminStatus: () => Promise<boolean>;
}

const EditableContext = createContext<EditableContextType>({
  contentMap: {},
  canEdit: false,
  editModeEnabled: false,
  setEditModeEnabled: () => {},
  saveContent: async () => false,
  isLoading: false,
  fetchPageContent: async () => {},
  isEditing: null,
  handleEdit: () => {},
  handleSave: async () => false,
  handleCancel: () => {},
  toggleEditMode: () => {},
  checkAdminStatus: async () => false,
});

export const useEditableContent = () => {
  const context = useContext(EditableContext);
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};

export const EditableContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, user } = useAuth();
  const { 
    saveContent: saveInlineContent, 
    fetchContent, 
    isLoading, 
    canEdit: inlineEditCanEdit, 
    isEditing, 
    setIsEditing, 
    checkAdminDirectly
  } = useInlineEdit();

  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);

  // Function to directly check admin status
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('[EditableContentProvider] Performing direct admin check');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin', { 
        user_id: user.id 
      });
      
      if (rpcError) {
        console.error('[EditableContentProvider] Direct admin check error:', rpcError);
        return false;
      }
      
      console.log('[EditableContentProvider] Direct admin check result:', rpcResult);
      setDirectAdminCheck(rpcResult === true);
      
      return rpcResult === true;
    } catch (error) {
      console.error('[EditableContentProvider] Error in direct admin check:', error);
      return false;
    }
  };

  // Run direct admin check when component mounts if needed
  useEffect(() => {
    if (user && isAdmin !== true && directAdminCheck === null) {
      checkAdminStatus();
    }
  }, [user, isAdmin, directAdminCheck]);

  // HIGHEST PRIORITY: Determine effective canEdit status
  // Always immediately prioritize isAdmin from auth context
  const effectiveCanEdit = React.useMemo(() => {
    console.log('[EditableContentProvider] Computing effectiveCanEdit:');
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] directAdminCheck =', directAdminCheck);
    console.log('[EditableContentProvider] inlineEditCanEdit =', inlineEditCanEdit);
    
    // If auth context says user is admin, immediately return true
    if (isAdmin === true) {
      console.log('[EditableContentProvider] Admin from auth context - canEdit = true');
      return true;
    }
    
    // If direct admin check confirms admin, return true
    if (directAdminCheck === true) {
      console.log('[EditableContentProvider] Admin from direct check - canEdit = true');
      return true;
    }
    
    // Fall back to inline edit permissions
    console.log('[EditableContentProvider] Using inlineEditCanEdit =', inlineEditCanEdit);
    return inlineEditCanEdit;
  }, [isAdmin, directAdminCheck, inlineEditCanEdit]);

  // Logging for debugging
  useEffect(() => {
    console.log('[EditableContentProvider] State update:');
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] directAdminCheck =', directAdminCheck);
    console.log('[EditableContentProvider] inlineEditCanEdit =', inlineEditCanEdit);
    console.log('[EditableContentProvider] effectiveCanEdit =', effectiveCanEdit);
    console.log('[EditableContentProvider] editModeEnabled =', editModeEnabled);
  }, [isAdmin, inlineEditCanEdit, effectiveCanEdit, directAdminCheck, editModeEnabled]);

  // If user loses edit permissions, turn off edit mode
  useEffect(() => {
    if (!effectiveCanEdit && editModeEnabled) {
      console.log('[EditableContentProvider] Disabling edit mode - no permissions');
      setEditModeEnabled(false);
    }
  }, [effectiveCanEdit, editModeEnabled]);

  const fetchPageContent = async () => {
    try {
      const content = await fetchContent(window.location.pathname);
      setContentMap(content);
    } catch (error) {
      console.error('[EditableContentProvider] Error fetching content:', error);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, []);

  useEffect(() => {
    if (isAdmin || effectiveCanEdit) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setEditModeEnabled(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAdmin, effectiveCanEdit, editModeEnabled]);

  const saveContent = async (id: string, content: string, contentType: string = 'text') => {
    const success = await saveInlineContent({
      page_path: window.location.pathname,
      element_id: id,
      content,
      content_type: contentType,
    });

    if (success) {
      setContentMap((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          content,
          content_type: contentType,
          page_path: window.location.pathname,
          element_id: id,
        },
      }));
      toast.success('Content saved successfully');
    } else {
      toast.error('Failed to save content');
    }

    return success;
  };

  const handleEdit = (id: string) => {
    if (!editModeEnabled) {
      console.log('[EditableContentProvider] Cannot edit - edit mode not enabled');
      return;
    }
    console.log('[EditableContentProvider] Setting isEditing for element:', id);
    setIsEditing(id);
  };

  const handleSave = async (content: EditableContent) => {
    const success = await saveInlineContent(content);
    if (success) {
      setContentMap((prev) => ({
        ...prev,
        [content.element_id]: content,
      }));
      setIsEditing(null);
      toast.success('Content saved successfully');
    } else {
      toast.error('Failed to save content');
    }
    return success;
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const toggleEditMode = () => {
    console.log('[EditableContentProvider] toggleEditMode called');
    console.log('[EditableContentProvider] effectiveCanEdit =', effectiveCanEdit);
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] directAdminCheck =', directAdminCheck);
    console.log('[EditableContentProvider] current editModeEnabled =', editModeEnabled);
    
    // Always prioritize admin check first
    if (isAdmin === true || directAdminCheck === true) {
      console.log('[EditableContentProvider] Admin detected, toggling edit mode');
      setEditModeEnabled(prev => !prev);
      return;
    }
    
    if (effectiveCanEdit) {
      console.log('[EditableContentProvider] User has edit permissions, toggling edit mode');
      setEditModeEnabled(prev => !prev);
    } else {
      // Try a direct admin check before giving up
      checkAdminStatus().then(isAdmin => {
        if (isAdmin) {
          console.log('[EditableContentProvider] Admin confirmed by direct check, enabling edit mode');
          setEditModeEnabled(true);
          toast.success('Admin permissions confirmed! Edit mode enabled');
        } else {
          console.log('[EditableContentProvider] Cannot toggle - no permissions confirmed');
          toast.error("You don't have permission to edit content");
        }
      });
    }
  };

  const contextValue = {
    contentMap,
    canEdit: effectiveCanEdit, // Use the computed effective value
    editModeEnabled,
    setEditModeEnabled,
    saveContent,
    isLoading,
    fetchPageContent,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel,
    toggleEditMode,
    checkAdminStatus,
  };

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};

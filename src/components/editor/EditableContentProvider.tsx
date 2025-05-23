
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInlineEdit, EditableContent } from '@/hooks/useInlineEdit';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
    canEdit, 
    isEditing, 
    setIsEditing, 
    checkAdminDirectly
  } = useInlineEdit();

  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  // Use the canEdit from useInlineEdit hook directly
  const effectiveCanEdit = canEdit;

  // Logging for debugging
  useEffect(() => {
    console.log('[EditableContentProvider] State update:');
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] canEdit =', canEdit);
    console.log('[EditableContentProvider] editModeEnabled =', editModeEnabled);
  }, [isAdmin, canEdit, editModeEnabled]);

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
    console.log('[EditableContentProvider] current editModeEnabled =', editModeEnabled);
    
    if (isAdmin === true || effectiveCanEdit) {
      console.log('[EditableContentProvider] User has edit permissions, toggling edit mode');
      setEditModeEnabled(prev => !prev);
    } else {
      // Try a direct admin check before giving up
      checkAdminDirectly().then(isAdminDirect => {
        if (isAdminDirect) {
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
    canEdit: effectiveCanEdit,
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
    checkAdminStatus: checkAdminDirectly,
  };

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};

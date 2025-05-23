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
});

export const useEditableContent = () => {
  const context = useContext(EditableContext);
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};

export const EditableContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const { saveContent: saveInlineContent, fetchContent, isLoading, canEdit: inlineEditCanEdit, isEditing, setIsEditing } = useInlineEdit();

  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [localCanEdit, setLocalCanEdit] = useState(false);
  const [adminInitialized, setAdminInitialized] = useState(false);

  // HIGHEST PRIORITY: Always immediately respect isAdmin status
  useEffect(() => {
    if (isAdmin === true) {
      console.log('[EditableContentProvider] isAdmin is true, enabling canEdit immediately');
      setLocalCanEdit(true);
      
      // Track that we've initialized admin status to prevent repeated updates
      if (!adminInitialized) {
        setAdminInitialized(true);
      }
    } else if (isAdmin === false) {
      // Only use inlineEditCanEdit when we know for sure user is not admin
      console.log('[EditableContentProvider] isAdmin is false, using inlineEditCanEdit:', inlineEditCanEdit);
      setLocalCanEdit(inlineEditCanEdit);
    }
  }, [isAdmin, inlineEditCanEdit, adminInitialized]);

  // Logging for debugging
  useEffect(() => {
    console.log('[EditableContentProvider] State update:');
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] inlineEditCanEdit =', inlineEditCanEdit);
    console.log('[EditableContentProvider] localCanEdit =', localCanEdit);
    console.log('[EditableContentProvider] adminInitialized =', adminInitialized);
  }, [isAdmin, inlineEditCanEdit, localCanEdit, adminInitialized]);

  // If user loses edit permissions, turn off edit mode
  useEffect(() => {
    if (!localCanEdit && editModeEnabled) {
      console.log('[EditableContentProvider] Disabling edit mode - no permissions');
      setEditModeEnabled(false);
    }
  }, [localCanEdit, editModeEnabled]);

  useEffect(() => {
    console.log('[EditableContentProvider] Edit mode is now:', editModeEnabled ? 'ENABLED' : 'DISABLED');
  }, [editModeEnabled]);

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
    if (isAdmin || localCanEdit) {
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
  }, [isAdmin, localCanEdit, editModeEnabled]);

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
    console.log('[EditableContentProvider] localCanEdit =', localCanEdit);
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] current editModeEnabled =', editModeEnabled);
    
    // Always prioritize isAdmin check before localCanEdit
    if (isAdmin === true) {
      const newMode = !editModeEnabled;
      console.log('[EditableContentProvider] Admin detected, setting editModeEnabled to:', newMode);
      setEditModeEnabled(newMode);
      
      // If this is the first time enabling edit mode, show a welcome message
      if (newMode && !adminInitialized) {
        toast.success('Welcome, admin! Edit mode is now enabled');
        setAdminInitialized(true);
      }
    } else if (localCanEdit) {
      const newMode = !editModeEnabled;
      console.log('[EditableContentProvider] User has edit permissions, setting editModeEnabled to:', newMode);
      setEditModeEnabled(newMode);
    } else {
      console.log('[EditableContentProvider] Cannot toggle - no permissions');
      toast.error("You don't have permission to edit content");
    }
  };

  const effectiveCanEdit = isAdmin === true || localCanEdit;

  const contextValue = {
    contentMap,
    canEdit: effectiveCanEdit, // Always prioritize isAdmin
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
  };

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};

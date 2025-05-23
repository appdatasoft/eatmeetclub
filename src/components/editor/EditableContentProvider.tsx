
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
  const { saveContent: saveInlineContent, fetchContent, isLoading, canEdit: inlineEditCanEdit } = useInlineEdit();

  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [localCanEdit, setLocalCanEdit] = useState(false);

  // PRIORITY: First react to isAdmin directly, then fallback to inlineEditCanEdit
  useEffect(() => {
    // Admin status is the highest priority
    if (isAdmin === true) {
      console.log('[EditableContentProvider] isAdmin is true, enabling canEdit immediately');
      setLocalCanEdit(true);
    } else {
      console.log('[EditableContentProvider] isAdmin is not true, using inlineEditCanEdit:', inlineEditCanEdit);
      setLocalCanEdit(inlineEditCanEdit);
    }
  }, [isAdmin, inlineEditCanEdit]);

  // Logging for debugging
  useEffect(() => {
    console.log('[EditableContentProvider] State update:');
    console.log('[EditableContentProvider] isAdmin =', isAdmin);
    console.log('[EditableContentProvider] inlineEditCanEdit =', inlineEditCanEdit);
    console.log('[EditableContentProvider] localCanEdit =', localCanEdit);
  }, [isAdmin, inlineEditCanEdit, localCanEdit]);

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
    if (localCanEdit) {
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
  }, [localCanEdit, editModeEnabled]);

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
    if (isAdmin === true || localCanEdit) {
      const newMode = !editModeEnabled;
      console.log('[EditableContentProvider] Setting editModeEnabled to:', newMode);
      setEditModeEnabled(newMode);
    } else {
      console.log('[EditableContentProvider] Cannot toggle - no permissions');
      toast.error("You don't have permission to edit content");
    }
  };

  const contextValue = {
    contentMap,
    canEdit: localCanEdit, // use our local state that prioritizes isAdmin
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

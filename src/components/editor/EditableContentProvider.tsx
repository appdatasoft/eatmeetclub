import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInlineEdit, EditableContent } from '@/hooks/useInlineEdit';
import { toast } from 'sonner';

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
  const { saveContent: saveInlineContent, fetchContent, isLoading, canEdit } = useInlineEdit();
  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('[EditableContentProvider] canEdit received from useInlineEdit:', canEdit, 'Type:', typeof canEdit);
    
    if (canEdit === false) {
      console.log('[EditableContentProvider] Edit access denied - canEdit is false');
    } else if (canEdit === true) {
      console.log('[EditableContentProvider] Edit access granted - canEdit is true');
    }
  }, [canEdit]);
  
  const fetchPageContent = async () => {
    try {
      console.log('[EditableContentProvider] Fetching page content for path:', window.location.pathname);
      const content = await fetchContent(window.location.pathname);
      console.log('[EditableContentProvider] Fetched content:', content);
      setContentMap(content);
    } catch (error) {
      console.error('[EditableContentProvider] Error fetching content:', error);
    }
  };
  
  // Load content on mount
  useEffect(() => {
    fetchPageContent();
  }, []);
  
  // Only add keyboard event listeners when user can edit
  useEffect(() => {
    if (canEdit) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setEditModeEnabled(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [canEdit]);
  
  const saveContent = async (id: string, content: string, contentType: string = 'text') => {
    const success = await saveInlineContent({
      page_path: window.location.pathname,
      element_id: id,
      content,
      content_type: contentType,
    });
    
    if (success) {
      // Update local state
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
  
  // Add new handlers for edit functionality
  const handleEdit = (id: string) => {
    setIsEditing(id);
  };
  
  const handleSave = async (content: EditableContent) => {
    const success = await saveInlineContent(content);
    
    if (success) {
      // Update local state
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
  
  // Toggle edit mode function
  const toggleEditMode = () => {
    console.log('[EditableContentProvider] Toggling edit mode from', editModeEnabled, 'to', !editModeEnabled, 'canEdit:', canEdit);
    
    // Only toggle if user can edit
    if (canEdit) {
      setEditModeEnabled(prev => !prev);
    } else {
      console.log('[EditableContentProvider] Cannot toggle edit mode - user does not have edit permission');
    }
  };
  
  const contextValue = {
    contentMap,
    canEdit,
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


import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { EditableContent, useInlineEdit } from '@/hooks/useInlineEdit';
import { useToast } from '@/hooks/use-toast';

interface EditableContentContextType {
  contentMap: Record<string, EditableContent>;
  isEditing: string | null;
  setIsEditing: (id: string | null) => void;
  handleEdit: (id: string) => void;
  handleSave: (content: EditableContent) => Promise<boolean>;
  handleCancel: () => void;
  isLoading: boolean;
  canEdit: boolean;
  editModeEnabled: boolean;
  toggleEditMode: () => void;
}

const EditableContentContext = createContext<EditableContentContextType | undefined>(undefined);

export const useEditableContent = () => {
  const context = useContext(EditableContentContext);
  if (!context) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};

export const EditableContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { fetchContent, saveContent, isEditing, setIsEditing, isLoading, canEdit } = useInlineEdit();
  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  const [editModeEnabled, setEditModeEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch content when the route changes
  useEffect(() => {
    if (location.pathname !== currentPath) {
      setCurrentPath(location.pathname);
      loadContent();
    }
  }, [location.pathname]);

  // Initial content load
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const content = await fetchContent(location.pathname);
    setContentMap(content);
  };

  const handleEdit = (id: string) => {
    if (!editModeEnabled) {
      toast({
        title: "Edit mode is disabled",
        description: "Please enable edit mode first",
        variant: "default",
      });
      return;
    }
    setIsEditing(id);
  };

  const handleSave = async (content: EditableContent) => {
    const success = await saveContent(content);
    if (success) {
      // Update the local content map
      setContentMap(prev => ({
        ...prev,
        [content.element_id]: content
      }));
      return true;
    }
    return false;
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const toggleEditMode = () => {
    if (isEditing && editModeEnabled) {
      // If turning off edit mode while editing, cancel the edit
      setIsEditing(null);
    }

    const newMode = !editModeEnabled;
    setEditModeEnabled(newMode);
    
    toast({
      title: newMode ? "Edit mode enabled" : "Edit mode disabled",
      description: newMode 
        ? "You can now edit content by clicking on editable elements" 
        : "Content is now in view mode",
      variant: "default",
    });
  };

  const value = {
    contentMap,
    isEditing,
    setIsEditing,
    handleEdit,
    handleSave,
    handleCancel,
    isLoading,
    canEdit,
    editModeEnabled,
    toggleEditMode
  };

  return (
    <EditableContentContext.Provider value={value}>
      {children}
    </EditableContentContext.Provider>
  );
};

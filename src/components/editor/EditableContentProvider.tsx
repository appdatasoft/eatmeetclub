
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { EditableContent, useInlineEdit } from '@/hooks/useInlineEdit';

interface EditableContentContextType {
  contentMap: Record<string, EditableContent>;
  isEditing: string | null;
  setIsEditing: (id: string | null) => void;
  handleEdit: (id: string) => void;
  handleSave: (content: EditableContent) => Promise<boolean>;
  handleCancel: () => void;
  isLoading: boolean;
  canEdit: boolean;
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

  const value = {
    contentMap,
    isEditing,
    setIsEditing,
    handleEdit,
    handleSave,
    handleCancel,
    isLoading,
    canEdit
  };

  return (
    <EditableContentContext.Provider value={value}>
      {children}
    </EditableContentContext.Provider>
  );
};

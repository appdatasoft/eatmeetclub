
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
  fetchPageContent: () => Promise<void>; // Added function to fetch page content
}

const EditableContext = createContext<EditableContextType>({
  contentMap: {},
  canEdit: false,
  editModeEnabled: false,
  setEditModeEnabled: () => {},
  saveContent: async () => false,
  isLoading: false,
  fetchPageContent: async () => {}, // Default implementation
});

export const useEditableContent = () => useContext(EditableContext);

export const EditableContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { saveContent: saveInlineContent, fetchContent, isLoading, canEdit } = useInlineEdit();
  const [contentMap, setContentMap] = useState<Record<string, EditableContent>>({});
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  
  const fetchPageContent = async () => {
    try {
      console.log('Fetching page content for path:', window.location.pathname);
      const content = await fetchContent(window.location.pathname);
      console.log('Fetched content:', content);
      setContentMap(content);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };
  
  useEffect(() => {
    fetchPageContent();
  }, []);
  
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
  
  const contextValue = {
    contentMap,
    canEdit,
    editModeEnabled,
    setEditModeEnabled,
    saveContent,
    isLoading,
    fetchPageContent, // Expose the function to components
  };
  
  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};

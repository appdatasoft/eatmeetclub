
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EditableContent {
  id?: string;
  page_path: string;
  element_id: string;
  content: string;
  content_type: string;
}

export const useInlineEdit = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Save content to the database
  const saveContent = async (content: EditableContent) => {
    if (!user || !isAdmin) {
      toast({
        title: "Permission denied",
        description: "You must be an admin to edit content",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Check if content already exists for this element
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_path', content.page_path)
        .eq('element_id', content.element_id)
        .single();
      
      let result;
      
      if (existingContent) {
        // Update existing content
        result = await supabase
          .from('page_content')
          .update({
            content: content.content,
            updated_by: user.id,
          })
          .eq('id', existingContent.id);
      } else {
        // Insert new content
        result = await supabase
          .from('page_content')
          .insert({
            ...content,
            created_by: user.id,
            updated_by: user.id,
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Content updated",
        description: "Your changes have been saved",
      });
      return true;
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: "Error saving content",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setIsEditing(null);
    }
  };
  
  // Fetch content from the database
  const fetchContent = async (page_path: string): Promise<Record<string, EditableContent>> => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_path', page_path);
      
      if (error) {
        throw error;
      }
      
      // Convert array to object with element_id as keys
      const contentMap: Record<string, EditableContent> = {};
      data?.forEach(item => {
        contentMap[item.element_id] = item as EditableContent;
      });
      
      return contentMap;
    } catch (error) {
      console.error('Error fetching content:', error);
      return {};
    }
  };
  
  return {
    saveContent,
    fetchContent,
    isEditing,
    setIsEditing,
    isLoading,
    canEdit: isAdmin && !!user,
  };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchWithRetry } from '@/utils/fetchUtils';

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
  
  // Add direct debug logging
  console.log('ADMIN_DEBUG: useInlineEdit - user:', user?.email, 'isAdmin:', isAdmin);
  
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
      const { data: existingContent, error: fetchError } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_path', content.page_path)
        .eq('element_id', content.element_id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        throw fetchError;
      }
      
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
  
  // Fetch content from the database with improved response handling
  const fetchContent = async (page_path: string): Promise<Record<string, EditableContent>> => {
    try {
      // Use caching to avoid multiple fetches
      const cacheKey = `page_content_${page_path}`;
      let contentMap: Record<string, EditableContent> = {};
      
      // Try to get from sessionStorage first
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.expiry > Date.now()) {
            console.log(`Using cached content for ${page_path}`);
            return parsedCache.data as Record<string, EditableContent>;
          }
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }
      
      // Fetch with retry and safe response handling
      const result = await fetchWithRetry(
        async () => {
          return await supabase
            .from('page_content')
            .select('*')
            .eq('page_path', page_path);
        },
        {
          retries: 2,
          baseDelay: 1000
        }
      );
      
      // Handle the response data safely
      if (result.error) {
        console.error("Error fetching content:", result.error);
        throw result.error;
      }
      
      const data = result.data;
      
      // Convert array to object with element_id as keys
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          contentMap[item.element_id] = item as EditableContent;
        });
        
        // Cache the result
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: contentMap,
            expiry: Date.now() + 300000 // 5 minutes cache
          }));
        } catch (e) {
          console.warn('Cache write error:', e);
        }
      } else {
        console.warn('Unexpected response format from page_content query:', data);
      }
      
      return contentMap;
    } catch (error: any) {
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

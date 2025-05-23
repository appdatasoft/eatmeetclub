import { useState, useEffect } from 'react';
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
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [roleCheckCompleted, setRoleCheckCompleted] = useState(false);
  
  // Immediately react to admin status changes with highest priority
  useEffect(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → Admin status change detected:', isAdmin);
    
    // If admin status is explicitly true, immediately enable editing
    if (isAdmin === true) {
      console.log('ADMIN_DEBUG: useInlineEdit → Admin confirmed, enabling edit mode');
      setCanEdit(true);
      setRoleCheckCompleted(true);
    } 
    // Only set to false if we're sure user is not admin and auth loading is complete
    else if (!authLoading && isAdmin === false) {
      console.log('ADMIN_DEBUG: useInlineEdit → Not admin, disabling edit mode');
      setCanEdit(false);
      setRoleCheckCompleted(true);
    }
    // If still loading or undefined, don't change anything yet
  }, [isAdmin, authLoading]);

  // Log canEdit changes
  useEffect(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → canEdit state updated to:', canEdit);
    console.log('ADMIN_DEBUG: useInlineEdit → roleCheckCompleted state is:', roleCheckCompleted);
  }, [canEdit, roleCheckCompleted]);

  const saveContent = async (content: EditableContent) => {
    // Always check isAdmin first with highest priority
    if (isAdmin !== true && !canEdit) {
      toast({
        title: 'Permission denied',
        description: 'You must be an admin to edit content',
        variant: 'destructive',
      });
      return false;
    }

    setIsSaving(true);

    try {
      const { data: existingContent, error: fetchError } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_path', content.page_path)
        .eq('element_id', content.element_id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const result = existingContent
        ? await supabase
            .from('page_content')
            .update({
              content: content.content,
              updated_by: user!.id,
            })
            .eq('id', existingContent.id)
        : await supabase
            .from('page_content')
            .insert({
              ...content,
              created_by: user!.id,
              updated_by: user!.id,
            });

      if (result.error) throw result.error;

      toast({
        title: 'Content updated',
        description: 'Your changes have been saved',
      });

      return true;
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error saving content',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
      setIsEditing(null);
    }
  };

  const fetchContent = async (page_path: string): Promise<Record<string, EditableContent>> => {
    try {
      const cacheKey = `page_content_${page_path}`;
      let contentMap: Record<string, EditableContent> = {};

      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.expiry > Date.now()) {
          console.log(`Using cached content for ${page_path}`);
          return parsed.data;
        }
      }

      const result = await fetchWithRetry<{data: EditableContent[], error: any}>(
        async () => {
          return await supabase
            .from('page_content')
            .select('*')
            .eq('page_path', page_path);
        },
        { retries: 2, baseDelay: 1000 }
      );

      if (result.error) throw result.error;

      const data = result.data;
      if (Array.isArray(data)) {
        data.forEach((item) => {
          contentMap[item.element_id] = item;
        });

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: contentMap,
            expiry: Date.now() + 300000, // 5 minutes
          })
        );
      }

      return contentMap;
    } catch (err) {
      console.error('Error fetching page content:', err);
      return {};
    }
  };

  return {
    saveContent,
    fetchContent,
    isEditing,
    setIsEditing,
    isLoading: isSaving,
    canEdit: isAdmin === true || canEdit, // HIGHEST PRIORITY: Always enable for admins
    roleCheckCompleted,
  };
};

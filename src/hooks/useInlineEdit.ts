import { useState, useEffect, useCallback } from 'react';
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
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);
  
  // Perform direct admin check independent of other systems
  const performDirectAdminCheck = useCallback(async () => {
    if (user && !roleCheckCompleted) {
      try {
        console.log('ADMIN_DEBUG: useInlineEdit → Performing direct admin check for:', user.email);
        const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin', { 
          user_id: user.id 
        });
        
        if (rpcError) {
          console.error('ADMIN_DEBUG: useInlineEdit → Direct admin check error:', rpcError);
          return false;
        }
        
        console.log('ADMIN_DEBUG: useInlineEdit → Direct admin check result:', rpcResult);
        setDirectAdminCheck(rpcResult === true);
        return rpcResult === true;
      } catch (error) {
        console.error('ADMIN_DEBUG: useInlineEdit → Error in direct admin check:', error);
        return false;
      }
    }
    return false;
  }, [user, roleCheckCompleted]);
  
  // Run direct admin check on initial load
  useEffect(() => {
    performDirectAdminCheck();
  }, [performDirectAdminCheck]);
  
  // Immediately react to admin status changes with highest priority
  useEffect(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → Admin status check:');
    console.log('ADMIN_DEBUG: useInlineEdit → isAdmin:', isAdmin);
    console.log('ADMIN_DEBUG: useInlineEdit → directAdminCheck:', directAdminCheck);
    
    // Check all admin sources
    const effectiveAdmin = isAdmin === true || directAdminCheck === true;
    
    // If admin status is confirmed from any source, immediately enable editing
    if (effectiveAdmin) {
      console.log('ADMIN_DEBUG: useInlineEdit → Admin confirmed, enabling edit mode');
      setCanEdit(true);
      setRoleCheckCompleted(true);
    } 
    // Only set to false if we're sure user is not admin and auth loading is complete
    else if (!authLoading && isAdmin === false && directAdminCheck === false) {
      console.log('ADMIN_DEBUG: useInlineEdit → Not admin, disabling edit mode');
      setCanEdit(false);
      setRoleCheckCompleted(true);
    }
  }, [isAdmin, authLoading, directAdminCheck]);

  // Log canEdit changes
  useEffect(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → canEdit state updated to:', canEdit);
    console.log('ADMIN_DEBUG: useInlineEdit → roleCheckCompleted state is:', roleCheckCompleted);
    console.log('ADMIN_DEBUG: useInlineEdit → directAdminCheck state is:', directAdminCheck);
  }, [canEdit, roleCheckCompleted, directAdminCheck]);

  const saveContent = async (content: EditableContent) => {
    // Check all admin sources first
    const effectiveAdmin = isAdmin === true || directAdminCheck === true;
    
    // Always check admin status first with highest priority
    if (!effectiveAdmin && !canEdit) {
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
    canEdit: isAdmin === true || directAdminCheck === true || canEdit, // HIGHEST PRIORITY: Always enable for admins from any source
    roleCheckCompleted,
    checkAdminDirectly: performDirectAdminCheck,
  };
};

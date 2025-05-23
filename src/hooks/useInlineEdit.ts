
import React, { useState, useEffect, useCallback } from 'react';
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
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);
  
  // Perform direct admin check independent of other systems
  const performDirectAdminCheck = useCallback(async () => {
    if (user) {
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
  }, [user]);
  
  // Run direct admin check on initial load if needed
  useEffect(() => {
    if (user && isAdmin !== true && directAdminCheck === null) {
      performDirectAdminCheck();
    }
  }, [user, isAdmin, directAdminCheck, performDirectAdminCheck]);
  
  // Compute effective canEdit value - prioritize auth context isAdmin
  const canEdit = React.useMemo(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → Computing canEdit:');
    console.log('ADMIN_DEBUG: useInlineEdit → isAdmin:', isAdmin);
    console.log('ADMIN_DEBUG: useInlineEdit → directAdminCheck:', directAdminCheck);
    console.log('ADMIN_DEBUG: useInlineEdit → authLoading:', authLoading);
    
    // HIGHEST PRIORITY: If auth context confirms admin, return true immediately
    if (isAdmin === true) {
      console.log('ADMIN_DEBUG: useInlineEdit → Admin from auth context - canEdit = true');
      return true;
    }
    
    // Second priority: If direct admin check confirms admin
    if (directAdminCheck === true) {
      console.log('ADMIN_DEBUG: useInlineEdit → Admin from direct check - canEdit = true');
      return true;
    }
    
    // If auth is still loading, don't make assumptions
    if (authLoading) {
      console.log('ADMIN_DEBUG: useInlineEdit → Auth still loading - canEdit = false');
      return false;
    }
    
    // If we have definitive non-admin status
    if (isAdmin === false && directAdminCheck === false) {
      console.log('ADMIN_DEBUG: useInlineEdit → Not admin - canEdit = false');
      return false;
    }
    
    // Default to false if uncertain
    console.log('ADMIN_DEBUG: useInlineEdit → Uncertain status - canEdit = false');
    return false;
  }, [isAdmin, directAdminCheck, authLoading]);

  // Log canEdit changes
  useEffect(() => {
    console.log('ADMIN_DEBUG: useInlineEdit → canEdit state updated to:', canEdit);
    console.log('ADMIN_DEBUG: useInlineEdit → directAdminCheck state is:', directAdminCheck);
  }, [canEdit, directAdminCheck]);

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
    canEdit, // Use the computed value
    roleCheckCompleted: true, // Always true now since we compute immediately
    checkAdminDirectly: performDirectAdminCheck,
  };
};

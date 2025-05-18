
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventDetails } from '@/types/event';

export const useAiContent = (event?: EventDetails | null) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate a social media post
  const generateSocialPost = async (context: string) => {
    if (!event?.id) return null;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          action: 'generate-social-post',
          content: context
        }
      });

      if (error) throw error;
      
      return data.post;
    } catch (error) {
      console.error('Error generating social post:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate social post. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateSocialPost
  };
};

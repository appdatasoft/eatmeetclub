
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AffiliateLink {
  id: string;
  event_id: string;
  user_id: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export const useAffiliateLinks = (eventId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [stats, setStats] = useState<AffiliateStats>({
    clicks: 0,
    conversions: 0,
    conversionRate: 0,
    revenue: 0
  });

  // Generate a code based on the user's name
  const generateCode = (firstName?: string, lastName?: string): string => {
    const first = firstName || user?.user_metadata?.full_name?.split(' ')[0] || 'user';
    const last = lastName || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';
    
    // Create a base code from name
    let code = `${first}${last ? '+' + last : ''}`.toLowerCase();
    
    // Remove special characters and replace spaces with '+'
    code = code.replace(/[^\w\s]/g, '').replace(/\s+/g, '+');
    
    // Add a random suffix for uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${code}-${randomSuffix}`;
  };

  // Fetch or create an affiliate link for a specific event
  const getOrCreateAffiliateLink = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate affiliate links",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      // Check if an affiliate link already exists for this event and user
      const { data: existingLinks, error: fetchError } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }

      if (existingLinks) {
        setAffiliateLink(existingLinks);
        await fetchAffiliateStats(existingLinks.id);
        return existingLinks;
      }

      // Create a new affiliate link if none exists
      const code = generateCode();
      
      const { data: newLink, error: insertError } = await supabase
        .from('affiliate_links')
        .insert({
          event_id: eventId,
          user_id: user.id,
          code
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setAffiliateLink(newLink as AffiliateLink);
      return newLink;
    } catch (err: any) {
      console.error('Error managing affiliate link:', err);
      toast({
        title: "Error",
        description: "Failed to generate affiliate link: " + err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics for a specific affiliate link
  const fetchAffiliateStats = async (affiliateLinkId: string) => {
    try {
      // Get click count
      const { count: clickCount, error: clickError } = await supabase
        .from('affiliate_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_link_id', affiliateLinkId)
        .eq('action_type', 'click');

      if (clickError) throw clickError;

      // Get conversion count and sum of conversion values
      const { data: conversionData, error: conversionError } = await supabase
        .from('affiliate_tracking')
        .select('conversion_value')
        .eq('affiliate_link_id', affiliateLinkId)
        .eq('action_type', 'conversion');

      if (conversionError) throw conversionError;

      const conversions = conversionData.length;
      const revenue = conversionData.reduce((sum, item) => sum + (item.conversion_value || 0), 0);
      const conversionRate = clickCount > 0 ? (conversions / clickCount) * 100 : 0;

      const newStats = {
        clicks: clickCount || 0,
        conversions,
        conversionRate,
        revenue
      };
      
      setStats(newStats);
      return newStats;
    } catch (err: any) {
      console.error('Error fetching affiliate stats:', err);
      return stats;
    }
  };

  // Track an affiliate link click
  const trackClick = async (code: string, eventId: string) => {
    try {
      // First, get the affiliate link ID from the code
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('code', code)
        .eq('event_id', eventId)
        .single();

      if (linkError) throw linkError;
      if (!linkData) throw new Error('Affiliate link not found');

      // Record the click
      const { error: trackError } = await supabase
        .from('affiliate_tracking')
        .insert({
          affiliate_link_id: linkData.id,
          event_id: eventId,
          referred_user_id: user?.id || null,
          ip_address: null, // We're not collecting IP for privacy reasons
          user_agent: navigator.userAgent,
          action_type: 'click'
        });

      if (trackError) throw trackError;
      return true;
    } catch (err: any) {
      console.error('Error tracking affiliate click:', err);
      return false;
    }
  };

  // Track an affiliate link conversion (ticket purchase)
  const trackConversion = async (code: string, eventId: string, ticketId: string, value: number) => {
    try {
      // First, get the affiliate link ID from the code
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('code', code)
        .eq('event_id', eventId)
        .single();

      if (linkError) throw linkError;
      if (!linkData) throw new Error('Affiliate link not found');

      // Record the conversion
      const { error: trackError } = await supabase
        .from('affiliate_tracking')
        .insert({
          affiliate_link_id: linkData.id,
          event_id: eventId,
          referred_user_id: user?.id || null,
          action_type: 'conversion',
          conversion_value: value,
          ticket_id: ticketId
        });

      if (trackError) throw trackError;
      return true;
    } catch (err: any) {
      console.error('Error tracking affiliate conversion:', err);
      return false;
    }
  };

  // Generate the full affiliate URL for an event
  const getAffiliateUrl = (eventSlug: string): string => {
    if (!affiliateLink) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/e/${eventSlug}?ref=${affiliateLink.code}`;
  };

  // Load affiliate link on component mount if eventId is provided
  useEffect(() => {
    if (eventId && user) {
      getOrCreateAffiliateLink(eventId);
    }
  }, [eventId, user]);

  return {
    isLoading,
    affiliateLink,
    stats,
    getOrCreateAffiliateLink,
    fetchAffiliateStats,
    trackClick,
    trackConversion,
    getAffiliateUrl
  };
};

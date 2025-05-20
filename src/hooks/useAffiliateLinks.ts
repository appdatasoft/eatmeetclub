
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useAffiliateLinks = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);

  // Generate a referral code from user's name or email
  const generateReferralCode = (eventId: string): string => {
    if (!user) return '';
    
    // Get user name from metadata or use email username
    const fullName = user.user_metadata?.full_name;
    let code = '';
    
    if (fullName) {
      // Use first and last name
      const nameParts = fullName.split(' ');
      if (nameParts.length > 1) {
        code = `${nameParts[0]}-${nameParts[nameParts.length - 1]}`.toLowerCase();
      } else {
        code = nameParts[0].toLowerCase();
      }
    } else if (user.email) {
      // Use email username part
      code = user.email.split('@')[0];
    } else {
      // Fallback to user ID
      code = user.id.substring(0, 8);
    }
    
    // Add event ID portion to make it unique
    code = `${code}-${eventId.substring(0, 6)}`;
    
    // Remove special characters and sanitize
    return code.replace(/[^a-z0-9-]/g, '');
  };

  // Create a new affiliate link for an event
  const createAffiliateLink = async (eventId: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create affiliate links", variant: "destructive" });
      return null;
    }
    
    try {
      setIsGenerating(true);
      
      // Check if user already has a link for this event
      const { data: existingLinks } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      if (existingLinks) {
        return existingLinks;
      }
      
      // Create a new affiliate link
      const code = generateReferralCode(eventId);
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
            code
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({ title: "Success", description: "Affiliate link created successfully!" });
      return data;
    } catch (error: any) {
      console.error("Error creating affiliate link:", error);
      toast({ title: "Error", description: error.message || "Failed to create affiliate link", variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Get affiliate link for a specific event
  const getAffiliateLink = async (eventId: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data || null;
    } catch (error) {
      console.error("Error fetching affiliate link:", error);
      return null;
    }
  };

  // Track a click on an affiliate link
  const trackClick = async (referralCode: string, eventId: string) => {
    try {
      // Find the affiliate link ID using the referral code
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('code', referralCode)
        .eq('event_id', eventId)
        .single();
      
      if (linkError) throw linkError;
      
      // Record the click in tracking table
      const { error: trackError } = await supabase
        .from('affiliate_tracking')
        .insert([
          {
            affiliate_link_id: linkData.id,
            event_id: eventId,
            action_type: 'click',
            referred_user_id: user?.id,
            ip_address: 'anonymous', // For privacy reasons
            user_agent: navigator.userAgent.substring(0, 255)
          }
        ]);
      
      if (trackError) throw trackError;
      
      return true;
    } catch (error) {
      console.error("Error tracking click:", error);
      return false;
    }
  };

  // Fetch all affiliate links for the current user
  const fetchAffiliateLinks = async () => {
    if (!user) return [];
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .select(`
          id,
          code,
          created_at,
          event_id,
          events (
            id,
            title,
            date
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get stats for each link
      const linksWithStats = await Promise.all(
        data.map(async (link) => {
          // Get click count
          const { count: clickCount, error: clickError } = await supabase
            .from('affiliate_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_link_id', link.id)
            .eq('action_type', 'click');
          
          // Get conversion count
          const { count: conversionCount, error: convError } = await supabase
            .from('affiliate_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_link_id', link.id)
            .eq('action_type', 'conversion');
          
          // Get total earnings (sum of conversion values)
          const { data: earnings, error: earningsError } = await supabase
            .from('affiliate_tracking')
            .select('conversion_value')
            .eq('affiliate_link_id', link.id)
            .eq('action_type', 'conversion');
          
          const totalEarnings = earnings?.reduce((sum, item) => sum + (parseFloat(item.conversion_value) || 0), 0) || 0;
          
          return {
            ...link,
            clicks: clickCount || 0,
            conversions: conversionCount || 0,
            earnings: totalEarnings
          };
        })
      );
      
      setAffiliateLinks(linksWithStats);
      return linksWithStats;
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
      toast({ title: "Error", description: "Failed to fetch affiliate links", variant: "destructive" });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAffiliateLink,
    getAffiliateLink,
    trackClick,
    fetchAffiliateLinks,
    affiliateLinks,
    isLoading,
    isGenerating
  };
};

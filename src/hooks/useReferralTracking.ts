
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useAffiliateLinks } from './useAffiliateLinks';

export const useReferralTracking = (eventId?: string) => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();
  const referralCode = searchParams.get('ref');
  const { trackClick } = useAffiliateLinks();
  const [hasTracked, setHasTracked] = useState(false);
  
  // Extract event ID from slug if needed
  const extractEventIdFromSlug = () => {
    if (params.slug && !eventId) {
      // Expected format: event-name-{eventId}
      const slugParts = params.slug.split('-');
      if (slugParts.length > 0) {
        // Last part should be the event ID
        return slugParts[slugParts.length - 1];
      }
    }
    return null;
  };

  const resolvedEventId = eventId || extractEventIdFromSlug();
  
  useEffect(() => {
    const trackReferral = async () => {
      if (referralCode && resolvedEventId && !hasTracked) {
        console.log(`Tracking referral: code=${referralCode}, eventId=${resolvedEventId}`);
        
        // Store referral code in sessionStorage for later conversion tracking
        sessionStorage.setItem(`ref_${resolvedEventId}`, referralCode);
        
        // Track the click event
        await trackClick(referralCode, resolvedEventId);
        setHasTracked(true);
      }
    };
    
    trackReferral();
  }, [referralCode, resolvedEventId, trackClick, hasTracked]);
  
  // Log affiliate tracking for debugging
  useEffect(() => {
    if (resolvedEventId) {
      const storedReferralCode = sessionStorage.getItem(`ref_${resolvedEventId}`);
      if (storedReferralCode) {
        console.log(`Active referral for event ${resolvedEventId}: ${storedReferralCode}`);
      }
    }
  }, [resolvedEventId, location.pathname]);
  
  // Get the stored referral code for a specific event
  const getStoredReferralCode = (eventId: string): string | null => {
    return sessionStorage.getItem(`ref_${eventId}`);
  };
  
  // Generate an affiliate URL with the current referral code
  const generateAffiliateUrl = (eventId: string, eventSlug: string, code: string): string => {
    const baseUrl = window.location.origin;
    // Create SEO-friendly URL with the affiliate code
    return `${baseUrl}/e/${eventSlug}-${eventId}?ref=${code}`;
  };
  
  return {
    referralCode,
    getStoredReferralCode,
    resolvedEventId,
    generateAffiliateUrl
  };
};

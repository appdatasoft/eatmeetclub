
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
    if (params.slug) {
      // Extract UUID from slug format "name-name-uuid"
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i;
      const match = params.slug.match(uuidPattern);
      
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Also check the id param format if we're on a /event/:id route
    if (params.id) {
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i;
      const match = params.id.match(uuidPattern);
      
      if (match && match[1]) {
        return match[1];
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

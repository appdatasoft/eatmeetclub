
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAffiliateLinks } from './useAffiliateLinks';

export const useReferralTracking = (eventId?: string) => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { trackClick } = useAffiliateLinks();
  const [hasTracked, setHasTracked] = useState(false);
  
  useEffect(() => {
    const trackReferral = async () => {
      if (referralCode && eventId && !hasTracked) {
        // Store referral code in sessionStorage for later conversion tracking
        sessionStorage.setItem(`ref_${eventId}`, referralCode);
        
        // Track the click event
        await trackClick(referralCode, eventId);
        setHasTracked(true);
      }
    };
    
    trackReferral();
  }, [referralCode, eventId, trackClick, hasTracked]);
  
  // Get the stored referral code for a specific event
  const getStoredReferralCode = (eventId: string): string | null => {
    return sessionStorage.getItem(`ref_${eventId}`);
  };
  
  return {
    referralCode,
    getStoredReferralCode
  };
};

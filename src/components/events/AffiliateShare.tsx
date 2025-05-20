
import { useState, useEffect } from 'react';
import { Check, Copy, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useToast } from '@/hooks/use-toast';

interface AffiliateShareProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
}

export const AffiliateShare = ({ eventId, eventTitle, eventSlug }: AffiliateShareProps) => {
  const { toast } = useToast();
  const { 
    isLoading, 
    getOrCreateAffiliateLink,
    affiliateLink,
    stats,
    getAffiliateUrl
  } = useAffiliateLinks(eventId);
  
  const [affiliateUrl, setAffiliateUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (affiliateLink) {
      const url = getAffiliateUrl(eventSlug);
      setAffiliateUrl(url);
    }
  }, [affiliateLink, eventSlug, getAffiliateUrl]);

  const handleGenerateLink = async () => {
    await getOrCreateAffiliateLink(eventId);
  };

  const handleCopyLink = () => {
    if (!affiliateUrl) return;
    
    navigator.clipboard.writeText(affiliateUrl).then(
      () => {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Affiliate link copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      }
    );
  };

  const handleShare = async () => {
    if (!affiliateUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me at ${eventTitle}`,
          text: `I'm attending ${eventTitle}. Join me by using this link!`,
          url: affiliateUrl,
        });
        toast({
          title: "Success!",
          description: "Link shared successfully",
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast({
            title: "Sharing failed",
            description: "Unable to share the link",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback to copying to clipboard
      handleCopyLink();
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Share This Event</CardTitle>
        <CardDescription>
          Share this event with friends and track your referrals
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!affiliateLink && !isLoading ? (
          <Button 
            onClick={handleGenerateLink} 
            variant="outline" 
            className="w-full"
          >
            Generate Affiliate Link
          </Button>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Input
                value={affiliateUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {navigator.share && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Stats display */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-muted rounded-md p-2">
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-lg font-medium">{stats.clicks}</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-lg font-medium">{stats.conversions}</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-sm text-muted-foreground">Conv. Rate</p>
                  <p className="text-lg font-medium">{stats.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-lg font-medium">${stats.revenue.toFixed(2)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateShare;

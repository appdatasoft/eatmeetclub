
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ExternalLink, Copy, Check, Mail, Link, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateLink, AffiliateStats } from "@/hooks/useAffiliateLinks";
import { Spinner } from "@/components/ui/spinner";
import SupabaseImage from "@/components/common/SupabaseImage";

export const AffiliateLinksTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<
    (AffiliateLink & { event: { title: string; cover_image?: string; date: string }; stats: AffiliateStats })[]
  >([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching affiliate links for user:", user.id);
        
        const { data: links, error } = await supabase
          .from("affiliate_links")
          .select(
            `
            id,
            event_id,
            user_id,
            code,
            created_at,
            updated_at,
            event:events (
              id,
              title,
              date,
              cover_image
            )
          `
          )
          .eq("user_id", user.id);

        if (error) throw error;

        console.log("Fetched links:", links);

        // Fetch stats for each link
        const linksWithStats = await Promise.all(
          (links || []).map(async (link) => {
            try {
              // Get click count
              const { count: clickCount, error: clickError } = await supabase
                .from("affiliate_tracking")
                .select("*", { count: "exact", head: true })
                .eq("affiliate_link_id", link.id)
                .eq("action_type", "click");

              if (clickError) throw clickError;

              // Get conversion count and sum
              const { data: conversionData, error: conversionError } = await supabase
                .from("affiliate_tracking")
                .select("conversion_value")
                .eq("affiliate_link_id", link.id)
                .eq("action_type", "conversion");

              if (conversionError) throw conversionError;

              const conversions = conversionData?.length || 0;
              const revenue = conversionData?.reduce(
                (sum, item) => sum + (parseFloat(item.conversion_value?.toString() || '0')),
                0
              ) || 0;
              const conversionRate = clickCount > 0 ? (conversions / clickCount) * 100 : 0;

              return {
                ...link,
                stats: {
                  clicks: clickCount || 0,
                  conversions,
                  conversionRate,
                  revenue,
                },
              };
            } catch (err) {
              console.error("Error fetching stats for link:", link.id, err);
              return {
                ...link,
                stats: {
                  clicks: 0,
                  conversions: 0,
                  conversionRate: 0,
                  revenue: 0,
                },
              };
            }
          })
        );

        setAffiliateLinks(linksWithStats);
      } catch (err: any) {
        console.error("Error fetching affiliate links:", err);
        setError(err.message || "Failed to load affiliate links");
        toast({
          title: "Error",
          description: err.message || "Failed to load affiliate links",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [user, toast]);

  const getAffiliateUrl = (code: string, eventTitle: string): string => {
    const baseUrl = window.location.origin;
    const eventSlug = eventTitle
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    return `${baseUrl}/e/${eventSlug}?ref=${code}`;
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopiedLinkId(id);
        toast({
          title: "Link copied!",
          description: "Affiliate link copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedLinkId(null);
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

  const handleSocialShare = async (platform: string, url: string, eventTitle: string, id: string) => {
    let shareUrl = '';
    const message = `Join me at ${eventTitle}!`;
    
    switch(platform) {
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(`${message}\n\n${url}`)}`;
        break;
      case 'tiktok':
        // TikTok doesn't have a direct share URL, so we'll just copy to clipboard
        await navigator.clipboard.writeText(url);
        setCopiedShareId(id);
        toast({
          title: "Link copied for TikTok!",
          description: "Paste this link when creating your TikTok content",
        });
        setTimeout(() => setCopiedShareId(null), 2000);
        return;
      case 'instagram':
        // Instagram doesn't have a direct share URL either, so copy to clipboard
        await navigator.clipboard.writeText(url);
        setCopiedShareId(id);
        toast({
          title: "Link copied for Instagram!",
          description: "Paste this link in your Instagram bio or story",
        });
        setTimeout(() => setCopiedShareId(null), 2000);
        return;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: message,
              text: message,
              url: url,
            });
            return;
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Error sharing:', err);
            }
          }
        }
        
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(url);
        setCopiedShareId(id);
        toast({
          title: "Link copied!",
          description: "Affiliate link copied to clipboard",
        });
        setTimeout(() => setCopiedShareId(null), 2000);
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleRetry = () => {
    if (user) {
      setError(null);
      setIsLoading(true);
      // Re-fetch the affiliate links
      const fetchLinks = async () => {
        try {
          const { data: links, error } = await supabase
            .from("affiliate_links")
            .select(
              `
              id,
              event_id,
              user_id,
              code,
              created_at,
              updated_at,
              event:events (
                id,
                title,
                date,
                cover_image
              )
            `
            )
            .eq("user_id", user.id);

          if (error) throw error;

          // Process the links as before
          const linksWithStats = await Promise.all(
            (links || []).map(async (link) => {
              try {
                // Get click count
                const { count: clickCount, error: clickError } = await supabase
                  .from("affiliate_tracking")
                  .select("*", { count: "exact", head: true })
                  .eq("affiliate_link_id", link.id)
                  .eq("action_type", "click");

                if (clickError) throw clickError;

                // Get conversion count and sum
                const { data: conversionData, error: conversionError } = await supabase
                  .from("affiliate_tracking")
                  .select("conversion_value")
                  .eq("affiliate_link_id", link.id)
                  .eq("action_type", "conversion");

                if (conversionError) throw conversionError;

                const conversions = conversionData?.length || 0;
                const revenue = conversionData?.reduce(
                  (sum, item) => sum + (parseFloat(item.conversion_value?.toString() || '0')),
                  0
                ) || 0;
                const conversionRate = clickCount > 0 ? (conversions / clickCount) * 100 : 0;

                return {
                  ...link,
                  stats: {
                    clicks: clickCount || 0,
                    conversions,
                    conversionRate,
                    revenue,
                  },
                };
              } catch (err) {
                console.error("Error fetching stats for link:", link.id, err);
                return {
                  ...link,
                  stats: {
                    clicks: 0,
                    conversions: 0,
                    conversionRate: 0,
                    revenue: 0,
                  },
                };
              }
            })
          );

          setAffiliateLinks(linksWithStats);
        } catch (err: any) {
          console.error("Error fetching affiliate links:", err);
          setError(err.message || "Failed to load affiliate links");
          toast({
            title: "Error",
            description: err.message || "Failed to load affiliate links",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchLinks();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" className="text-primary" />
        <span className="ml-3">Loading your affiliate links...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Failed to load affiliate links: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (affiliateLinks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You don't have any affiliate links yet. Visit an event page to create one.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎟️ Event Affiliate Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Event Image</TableHead>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Copy Link</TableHead>
                <TableHead>Platforms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateLinks.map((link) => {
                const affiliateUrl = getAffiliateUrl(link.code, link.event?.title || '');
                const eventDate = link.event?.date ? formatDate(link.event.date) : 'TBD';
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="h-12 w-16 overflow-hidden rounded-md">
                        <SupabaseImage
                          src={link.event?.cover_image || ''}
                          alt={link.event?.title || 'Event'}
                          className="h-full w-full object-cover"
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='8' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3E🖼️%3C/text%3E%3C/svg%3E"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {link.event?.title || 'Unknown Event'}
                    </TableCell>
                    <TableCell>{eventDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(link.id, affiliateUrl)}
                        className="flex items-center gap-1"
                      >
                        {copiedLinkId === link.id ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSocialShare('tiktok', affiliateUrl, link.event?.title || '', link.id)}
                          title="Share on TikTok"
                          className="h-8 w-8"
                        >
                          <span className="text-xs">📸</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSocialShare('email', affiliateUrl, link.event?.title || '', link.id)}
                          title="Share via Email"
                          className="h-8 w-8"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSocialShare('instagram', affiliateUrl, link.event?.title || '', link.id)}
                          title="Share on Instagram"
                          className="h-8 w-8"
                        >
                          <span className="text-xs">IG</span>
                        </Button>
                        
                        {copiedShareId === link.id && (
                          <span className="text-xs text-green-600 animate-fade-in">
                            Copied!
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateLinksTable;

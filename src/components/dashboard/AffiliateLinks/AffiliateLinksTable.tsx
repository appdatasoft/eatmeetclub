
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
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

export const AffiliateLinksTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateLinks, setAffiliateLinks] = useState<
    (AffiliateLink & { event: { title: string }; stats: AffiliateStats })[]
  >([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data: links, error } = await supabase
          .from("affiliate_links")
          .select(
            `
            *,
            event:events (
              id,
              title
            )
          `
          )
          .eq("user_id", user.id);

        if (error) throw error;

        // Fetch stats for each link
        const linksWithStats = await Promise.all(
          (links || []).map(async (link) => {
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

            const conversions = conversionData.length;
            const revenue = conversionData.reduce(
              (sum, item) => sum + (item.conversion_value || 0),
              0
            );
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
          })
        );

        setAffiliateLinks(linksWithStats);
      } catch (err: any) {
        console.error("Error fetching affiliate links:", err);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Affiliate Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden md:table-cell">Date Created</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateLinks.map((link) => {
                const affiliateUrl = getAffiliateUrl(link.code, link.event.title);
                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.event.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(link.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{link.stats.clicks}</TableCell>
                    <TableCell>
                      {link.stats.conversions} 
                      <span className="text-xs text-muted-foreground ml-1">
                        ({link.stats.conversionRate.toFixed(1)}%)
                      </span>
                    </TableCell>
                    <TableCell>${link.stats.revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(link.id, affiliateUrl)}
                        >
                          {copiedLinkId === link.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
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

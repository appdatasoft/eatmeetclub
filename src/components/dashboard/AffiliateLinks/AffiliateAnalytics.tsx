import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, ArrowDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsStat {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface ClickData {
  date: string;
  clicks: number;
}

const AffiliateAnalytics = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [stats, setStats] = useState<AnalyticsStat[]>([]);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    if (user && code) {
      fetchAffiliateData();
    }
  }, [user, code, timeframe]);

  const fetchAffiliateData = async () => {
    if (!code) {
      setError('No affiliate code provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the affiliate link details
      const { data: affiliateLink, error: linkError } = await supabase
        .from('affiliate_links')
        .select(`
          id,
          code,
          event_id,
          event:events (
            title,
            date,
            cover_image
          )
        `)
        .eq('code', code)
        .eq('user_id', user?.id)
        .single();

      if (linkError) {
        throw linkError;
      }

      if (!affiliateLink) {
        throw new Error('Affiliate link not found');
      }

      setAffiliate(affiliateLink);

      // Get the tracking data for this affiliate link
      const timeFilter = getTimeFilter(timeframe);
      const { data: trackingData, error: trackingError } = await supabase
        .from('affiliate_tracking')
        .select('*')
        .eq('affiliate_link_id', affiliateLink.id)
        .gte('created_at', timeFilter)
        .order('created_at', { ascending: true });

      if (trackingError) {
        throw trackingError;
      }

      // Calculate stats
      const clicks = trackingData.filter(item => item.action_type === 'click').length;
      const conversions = trackingData.filter(item => item.action_type === 'conversion').length;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const revenue = trackingData
        .filter(item => item.action_type === 'conversion')
        .reduce((sum, item) => sum + (parseFloat(item.conversion_value) || 0), 0);

      // Prepare stats for display
      setStats([
        {
          title: 'Total Clicks',
          value: clicks,
          icon: <TrendingUp className="h-4 w-4 text-green-500" />,
          trend: 'up'
        },
        {
          title: 'Conversions',
          value: conversions,
        },
        {
          title: 'Conversion Rate',
          value: `${conversionRate.toFixed(1)}%`,
        },
        {
          title: 'Revenue',
          value: `$${revenue.toFixed(2)}`,
        }
      ]);

      // Prepare chart data
      const clicksByDay = processClickData(trackingData);
      setClickData(clicksByDay);

    } catch (err: any) {
      console.error('Error fetching affiliate analytics:', err);
      setError(err.message);
      toast({
        title: 'Error loading analytics',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeFilter = (timeframe: string) => {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
  };

  const processClickData = (trackingData: any[]) => {
    const clicksOnly = trackingData.filter(item => item.action_type === 'click');
    const dateGroups: Record<string, number> = {};

    // Group clicks by date
    clicksOnly.forEach(click => {
      const date = new Date(click.created_at).toLocaleDateString();
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    // Convert to array format for chart
    return Object.entries(dateGroups).map(([date, clicks]) => ({
      date,
      clicks
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" className="text-primary" />
        <span className="ml-3">Loading affiliate analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load affiliate analytics: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={fetchAffiliateData}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!affiliate) {
    return (
      <Alert>
        <AlertDescription>
          No affiliate link found with code: {code}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Affiliate Analytics for "{affiliate.event?.title}"</h1>
        <p className="text-muted-foreground">Code: {code}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold">{stat.value}</p>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Click Activity</CardTitle>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="day">24h</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {clickData.length > 0 ? (
              <ChartContainer 
                config={{
                  clicks: { label: 'Clicks', theme: { light: '#2563eb', dark: '#3b82f6' } },
                }}
              >
                <BarChart data={clickData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Clicks
                              </span>
                              <span className="font-bold">
                                {payload[0].value?.toString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar
                    dataKey="clicks"
                    fill="rgba(37, 99, 235, 1)"
                    radius={[4, 4, 0, 0]}
                    name="clicks"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No click data available for selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
//
export default AffiliateAnalytics;

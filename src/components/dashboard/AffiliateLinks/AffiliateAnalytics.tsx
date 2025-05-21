import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as d3 from 'd3-format';

interface AffiliateClickData {
  created_at: string;
}

interface AffiliateSignupData {
  created_at: string;
}

interface ChartDataPoint {
  day: string;
  value: number;
}

const AffiliateAnalytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickData, setClickData] = useState<ChartDataPoint[]>([]);
  const [signupData, setSignupData] = useState<ChartDataPoint[]>([]);
  const [conversionData, setConversionData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range based on timeframe
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeframe) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }
        
        // Format dates for Supabase query
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fetch click data - using affiliate_tracking table with 'click' action type
        const { data: clicks, error: clicksError } = await supabase
          .from('affiliate_tracking')
          .select('created_at')
          .eq('action_type', 'click')
          .eq('affiliate_link_id', user.id) // Using user.id as affiliate_link_id for now
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);
          
        if (clicksError) throw new Error(clicksError.message);
        
        // Fetch signup data - using affiliate_tracking with action_type 'signup'
        const { data: signups, error: signupsError } = await supabase
          .from('affiliate_tracking')
          .select('created_at')
          .eq('action_type', 'signup')
          .eq('affiliate_link_id', user.id)
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);
          
        if (signupsError) throw new Error(signupsError.message);
        
        // Process data for charts
        const clicksByDay = processDataByDay(clicks || [], startDate, endDate);
        const signupsByDay = processDataByDay(signups || [], startDate, endDate);
        
        // Calculate conversion rates
        const conversionRates = calculateConversionRates(clicksByDay, signupsByDay);
        
        setClickData(clicksByDay);
        setSignupData(signupsByDay);
        setConversionData(conversionRates);
      } catch (err: any) {
        console.error('Error fetching affiliate analytics:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, timeframe]);
  
  // Helper function to process data by day
  const processDataByDay = (data: AffiliateClickData[] | AffiliateSignupData[], startDate: Date, endDate: Date) => {
    const result: ChartDataPoint[] = [];
    const dateMap = new Map<string, number>();
    
    // Initialize all dates in range with 0 count
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dateMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count occurrences by date
    data.forEach(item => {
      const dateStr = item.created_at.split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, dateMap.get(dateStr)! + 1);
      }
    });
    
    // Convert map to array for chart
    dateMap.forEach((count, dateStr) => {
      result.push({
        day: dateStr,
        value: count
      });
    });
    
    return result.sort((a, b) => a.day.localeCompare(b.day));
  };
  
  // Calculate conversion rates
  const calculateConversionRates = (clicks: ChartDataPoint[], signups: ChartDataPoint[]) => {
    return clicks.map((clickItem, index) => {
      const signupItem = signups[index];
      const clickCount = clickItem.value;
      const signupCount = signupItem ? signupItem.value : 0;
      
      return {
        day: clickItem.day,
        value: clickCount > 0 ? (signupCount / clickCount) * 100 : 0
      };
    });
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d');
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => {
    return d3.format('.1f')(value) + '%';
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Analytics</CardTitle>
          <CardDescription>Loading your performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load analytics data: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Analytics</CardTitle>
        <CardDescription>Track your affiliate link performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clicks" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="clicks">Clicks</TabsTrigger>
              <TabsTrigger value="signups">Signups</TabsTrigger>
              <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
            </TabsList>
            
            <TabsList>
              <TabsTrigger 
                value="7d" 
                onClick={() => setTimeframe('7d')}
                className={timeframe === '7d' ? 'bg-primary text-primary-foreground' : ''}
              >
                7 Days
              </TabsTrigger>
              <TabsTrigger 
                value="30d" 
                onClick={() => setTimeframe('30d')}
                className={timeframe === '30d' ? 'bg-primary text-primary-foreground' : ''}
              >
                30 Days
              </TabsTrigger>
              <TabsTrigger 
                value="90d" 
                onClick={() => setTimeframe('90d')}
                className={timeframe === '90d' ? 'bg-primary text-primary-foreground' : ''}
              >
                90 Days
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="clicks">
            <h3 className="text-lg font-medium mb-2">Link Clicks</h3>
            {clickData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => typeof value === 'number' ? value.toString() : formatDate(value)} 
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Date: ${formatDate(value.toString())}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Clicks" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] border rounded-md">
                <p className="text-muted-foreground">No click data available for this period</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="signups">
            <h3 className="text-lg font-medium mb-2">Referral Signups</h3>
            {signupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => typeof value === 'number' ? value.toString() : formatDate(value)} 
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Date: ${formatDate(value.toString())}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Signups" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] border rounded-md">
                <p className="text-muted-foreground">No signup data available for this period</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="conversion">
            <h3 className="text-lg font-medium mb-2">Conversion Rate</h3>
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => typeof value === 'number' ? value.toString() : formatDate(value)} 
                  />
                  <YAxis tickFormatter={(value) => formatPercentage(value)} />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${formatDate(value.toString())}`}
                    formatter={(value: any) => [formatPercentage(value), "Conversion Rate"]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Conversion %" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] border rounded-md">
                <p className="text-muted-foreground">No conversion data available for this period</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AffiliateAnalytics;

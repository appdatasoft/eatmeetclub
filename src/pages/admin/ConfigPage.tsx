import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConfigFormValues {
  EVENT_CREATION_FEE: string;
  MEMBERSHIP_FEE: string;
  stripe_mode: 'test' | 'live';
  service_fee_percent: string;
  commission_fee_percent: string;
}

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  description?: string | null;
}

const ConfigPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const form = useForm<ConfigFormValues>({
    defaultValues: {
      EVENT_CREATION_FEE: '50',
      MEMBERSHIP_FEE: '25',
      stripe_mode: 'test',
      service_fee_percent: '5',
      commission_fee_percent: '10',
    }
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true);
      setFetchError(null);
      
      try {
        // First get configs from admin_config (new implementation)
        const { data: adminConfigData, error: adminConfigError } = await supabase
          .from('admin_config')
          .select('*');
        
        // Then get configs from app_config (old implementation)
        const { data: appConfigData, error: appConfigError } = await supabase
          .from('app_config')
          .select('*');
        
        // Check if we got data from either table
        const hasAdminConfigData = adminConfigData && adminConfigData.length > 0;
        const hasAppConfigData = appConfigData && appConfigData.length > 0;
        
        if (!hasAdminConfigData && !hasAppConfigData) {
          console.warn("No configuration data found in either table");
          setFetchError("No configuration data found. Using default values.");
          // Continue with default values
        } else if (adminConfigError && appConfigError) {
          console.error("Failed to load configuration:", { adminConfigError, appConfigError });
          setFetchError("Failed to load configuration from database. Using default values.");
          // Continue with default values
        }
        
        // Combine and process the data
        const combinedConfigs: ConfigItem[] = [];
        
        // Process admin_config data (format as needed)
        if (adminConfigData) {
          adminConfigData.forEach((item: any) => {
            combinedConfigs.push({
              id: item.key,
              key: item.key,
              value: item.value,
              description: null
            });
          });
        }
        
        // Process app_config data
        if (appConfigData) {
          appConfigData.forEach((item: any) => {
            combinedConfigs.push({
              id: item.id,
              key: item.key,
              value: item.value,
              description: item.description
            });
          });
        }
        
        setConfigs(combinedConfigs);
        
        // Set form values from fetched data
        const configMap: Record<string, string> = {
          EVENT_CREATION_FEE: '50',
          MEMBERSHIP_FEE: '25',
          stripe_mode: 'test',
          service_fee_percent: '5',
          commission_fee_percent: '10',
        };
        
        // First set from app_config
        if (appConfigData) {
          appConfigData.forEach((item: any) => {
            if (['EVENT_CREATION_FEE', 'MEMBERSHIP_FEE'].includes(item.key)) {
              configMap[item.key] = item.value;
            }
          });
        }
        
        // Then override with admin_config values when available (higher priority)
        if (adminConfigData) {
          adminConfigData.forEach((item: any) => {
            if (item.key === 'membership_fee') {
              // Convert cents to dollars for display
              configMap['MEMBERSHIP_FEE'] = (parseInt(item.value, 10) / 100).toString();
            }
            if (item.key === 'event_creation_fee') {
              // Convert cents to dollars for display
              configMap['EVENT_CREATION_FEE'] = (parseInt(item.value, 10) / 100).toString(); 
            }
            if (item.key === 'stripe_mode') {
              configMap['stripe_mode'] = item.value;
            }
            if (item.key === 'service_fee_percent') {
              configMap['service_fee_percent'] = item.value;
            }
            if (item.key === 'commission_fee_percent') {
              configMap['commission_fee_percent'] = item.value;
            }
          });
        }
        
        form.reset(configMap as unknown as ConfigFormValues);
      } catch (error: any) {
        console.error('Error fetching configs:', error);
        setFetchError(error.message || "Failed to load configuration. Using default values.");
        // We don't reset the form here as we're using default values
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfigs();
  }, [toast, form]);

  const onSubmit = async (values: ConfigFormValues) => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error("Authentication required: " + sessionError.message);
      }
      
      if (!sessionData.session) {
        throw new Error("Authentication required");
      }
      
      // Convert dollar amounts to cents for storage in admin_config
      const membershipFeeCents = Math.round(parseFloat(values.MEMBERSHIP_FEE) * 100);
      const eventCreationFeeCents = Math.round(parseFloat(values.EVENT_CREATION_FEE) * 100);
      const serviceFeePct = parseFloat(values.service_fee_percent);
      const commissionFeePct = parseFloat(values.commission_fee_percent);
      
      // Update both tables for compatibility during migration
      
      // 1. Update admin_config table (new implementation)
      const adminConfigUpdates = [
        { 
          key: 'membership_fee',
          value: membershipFeeCents.toString()
        },
        { 
          key: 'event_creation_fee',
          value: eventCreationFeeCents.toString()
        },
        {
          key: 'stripe_mode',
          value: values.stripe_mode
        },
        {
          key: 'service_fee_percent',
          value: serviceFeePct.toString()
        },
        {
          key: 'commission_fee_percent',
          value: commissionFeePct.toString()
        }
      ];
      
      for (const update of adminConfigUpdates) {
        const { error } = await supabase
          .from('admin_config')
          .upsert(update, { onConflict: 'key' });
          
        if (error) throw error;
      }
      
      // 2. Also update app_config table for backward compatibility
      const appConfigUpdates = [
        { 
          key: 'MEMBERSHIP_FEE',
          value: values.MEMBERSHIP_FEE,
          updated_by: sessionData.session.user.id,
          updated_at: new Date().toISOString()
        },
        { 
          key: 'EVENT_CREATION_FEE',
          value: values.EVENT_CREATION_FEE,
          updated_by: sessionData.session.user.id,
          updated_at: new Date().toISOString()
        }
      ];
      
      for (const update of appConfigUpdates) {
        const { error } = await supabase
          .from('app_config')
          .upsert(update, { onConflict: 'key' });
          
        if (error) throw error;
      }
      
      toast({
        title: "Configuration updated",
        description: "The changes have been saved successfully"
      });
      
      // Clear any previous error
      setFetchError(null);
    } catch (error: any) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>
      
      {fetchError && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && configs.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Event Configuration</CardTitle>
                <CardDescription>
                  Manage event-related settings for your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="EVENT_CREATION_FEE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Creation Fee (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500">$</span>
                              </div>
                              <Input 
                                type="number" 
                                placeholder="50.00"
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            The amount charged to users when creating a new event
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="MEMBERSHIP_FEE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Membership Fee (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500">$</span>
                              </div>
                              <Input 
                                type="number" 
                                placeholder="25.00"
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            The monthly subscription fee for membership
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stripe_mode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Live Mode
                            </FormLabel>
                            <FormDescription>
                              Toggle between Stripe test mode and live mode
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === 'live'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'live' : 'test');
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !form.formState.isDirty}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
                <CardDescription>
                  Configure how ticket revenue is split between platform and event creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="service_fee_percent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Fee Percentage (%)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="5"
                                max="100"
                                min="0"
                                step="0.1"
                                className="pr-8" 
                                {...field}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">%</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Additional fee charged to ticket purchasers, retained by the platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commission_fee_percent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Fee Percentage (%)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="10"
                                max="100"
                                min="0"
                                step="0.1"
                                className="pr-8" 
                                {...field}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500">%</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Percentage of ticket base price retained by the platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <h3 className="font-medium mb-2">Payment Breakdown Example</h3>
                      <div className="space-y-1 text-sm">
                        <p>For a $100 ticket:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Service Fee: ${parseFloat(form.watch("service_fee_percent") || "5")} (paid by customer)</li>
                          <li>Commission Fee: ${parseFloat(form.watch("commission_fee_percent") || "10")} (from ticket revenue)</li>
                          <li>Event Creator Receives: ${100 - parseFloat(form.watch("commission_fee_percent") || "10")}</li>
                          <li>Total Customer Payment: ${100 + parseFloat(form.watch("service_fee_percent") || "5")}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !form.formState.isDirty}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </AdminLayout>
  );
};

export default ConfigPage;

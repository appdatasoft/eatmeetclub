
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { Settings } from 'lucide-react';

interface ConfigFormValues {
  EVENT_CREATION_FEE: string;
  MEMBERSHIP_FEE: string;
}

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  
  const form = useForm<ConfigFormValues>({
    defaultValues: {
      EVENT_CREATION_FEE: '50',
      MEMBERSHIP_FEE: '25',
    }
  });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Authentication required");
        }
        
        // Check admin status
        const { data: adminData, error: adminError } = await supabase.rpc(
          'is_admin',
          { user_id: sessionData.session.user.id }
        );
        
        if (adminError) throw adminError;
        
        if (!adminData) {
          setIsAdmin(false);
          throw new Error("Admin privileges required");
        }
        
        setIsAdmin(true);
        
        // Fetch configs
        const { data, error } = await supabase
          .from('app_config')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setConfigs(data as ConfigItem[]);
        
        // Set form values
        const configMap: Record<string, string> = {};
        
        // Initialize with default values
        configMap['EVENT_CREATION_FEE'] = '50';
        configMap['MEMBERSHIP_FEE'] = '25';
        
        // Override with actual values from database
        data.forEach((item: ConfigItem) => {
          configMap[item.key] = item.value;
        });
        
        form.reset(configMap as unknown as ConfigFormValues);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load configuration",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAndFetchData();
  }, [toast, form]);

  const onSubmit = async (values: ConfigFormValues) => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Authentication required");
      }
      
      // Update event creation fee
      const { error: eventFeeError } = await supabase
        .from('app_config')
        .update({ 
          value: values.EVENT_CREATION_FEE,
          updated_by: sessionData.session.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'EVENT_CREATION_FEE');
      
      if (eventFeeError) {
        throw eventFeeError;
      }

      // Update membership fee
      const { error: membershipFeeError } = await supabase
        .from('app_config')
        .upsert({ 
          key: 'MEMBERSHIP_FEE',
          value: values.MEMBERSHIP_FEE,
          updated_by: sessionData.session.user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      if (membershipFeeError) {
        throw membershipFeeError;
      }
      
      toast({
        title: "Configuration updated",
        description: "The changes have been saved successfully"
      });
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

  if (!isAdmin && !isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-10">
          <Settings className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 text-center">You don't have permission to access these settings.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Settings className="mr-2 h-6 w-6" /> Admin Settings
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
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
      )}
    </DashboardLayout>
  );
};

export default AdminSettings;

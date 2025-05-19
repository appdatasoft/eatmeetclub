
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { get, clearCache } from '@/lib/fetch-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SiteConfig {
  siteTitle: string;
  maintenanceMode: boolean;
  maxUsers: number;
}

const ConfigPage = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the new fetch client with caching
      const { data, error } = await get<SiteConfig>('/api/admin/config.json', {
        cacheTime: 30000, // 30 seconds cache
        retries: 2,
      });
      
      if (error) throw error;
      if (!data) throw new Error('No configuration data received');
      
      setConfig(data);
    } catch (err: any) {
      console.error('Error loading admin config:', err);
      setError(err?.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    // Clear cache and reload
    setIsRefreshing(true);
    clearCache('GET:/api/admin/config.json:{}');
    
    try {
      await loadConfig();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Configuration</h1>
      
      {loading && !isRefreshing && (
        <div className="py-4 text-center">
          <LoadingSpinner text="Loading configuration..." />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading configuration</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          </div>
        </Alert>
      )}
      
      {!loading && !error && config && (
        <div className="space-y-6">
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-medium mb-4">Site Configuration</h2>
            <dl className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 p-2 border-b">
                <dt className="font-medium text-gray-600">Site Title:</dt>
                <dd className="md:col-span-2">{config.siteTitle}</dd>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 p-2 border-b">
                <dt className="font-medium text-gray-600">Maintenance Mode:</dt>
                <dd className="md:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    config.maintenanceMode 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {config.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                </dd>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 p-2">
                <dt className="font-medium text-gray-600">Max Users:</dt>
                <dd className="md:col-span-2">{config.maxUsers.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Configuration'
              )}
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ConfigPage;

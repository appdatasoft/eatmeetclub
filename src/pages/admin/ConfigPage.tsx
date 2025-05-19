
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { fetchWithCache } from '@/utils/fetchUtils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ConfigPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWithCache('/api/admin/config.json', {
          cacheTime: 60000, // 1 minute cache
          acceptHeader: 'application/json'
        });
        
        setConfig(data);
      } catch (err: any) {
        console.error('Error loading admin config:', err);
        setError(err?.message || 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  const handleRefresh = () => {
    // Clear cache and reload
    fetchWithCache('/api/admin/config.json', {}, 'admin-config-clear');
    window.location.reload();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Configuration</h1>
      
      {loading && (
        <div className="py-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500">Loading configuration...</p>
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
            >
              Try Again
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
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh Configuration
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ConfigPage;

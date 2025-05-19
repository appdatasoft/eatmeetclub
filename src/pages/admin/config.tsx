// pages/admin/config.tsx

import { useEffect, useState } from 'react';
import { fetcher } from '../../lib/fetcher'; // Adjust path as needed

type AdminConfig = {
  siteTitle: string;
  maintenanceMode: boolean;
  maxUsers: number;
};

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetcher<AdminConfig>('/api/admin/config');
        setConfig(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load config');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) return <div className="p-4">Loading admin config...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Configuration</h1>
      <ul className="space-y-2">
        <li><strong>Site Title:</strong> {config?.siteTitle}</li>
        <li><strong>Maintenance Mode:</strong> {config?.maintenanceMode ? 'Enabled' : 'Disabled'}</li>
        <li><strong>Max Users:</strong> {config?.maxUsers}</li>
      </ul>
    </div>
  );
}

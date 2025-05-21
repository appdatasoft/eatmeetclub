
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RestaurantVerificationForm from '@/components/restaurants/RestaurantVerificationForm';
import { Restaurant } from '@/components/restaurants/types/restaurant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const RestaurantVerification = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!restaurantId) {
          setError('Restaurant ID is required');
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Restaurant not found');
        
        setRestaurant(data as Restaurant);
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setError(err.message || 'Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [restaurantId]);
  
  const handleRefresh = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
        
      if (error) throw error;
      setRestaurant(data as Restaurant);
    } catch (err) {
      console.error('Error refreshing restaurant data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Verification</h1>
        <p className="text-gray-600 mt-2">
          Complete the verification process to fully activate your restaurant on our platform.
        </p>
      </div>
      
      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-1/3" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : restaurant ? (
        <RestaurantVerificationForm 
          restaurant={restaurant} 
          onVerificationComplete={handleRefresh}
        />
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restaurant Not Found</AlertTitle>
          <AlertDescription>Unable to find the specified restaurant.</AlertDescription>
        </Alert>
      )}
    </DashboardLayout>
  );
};

export default RestaurantVerification;

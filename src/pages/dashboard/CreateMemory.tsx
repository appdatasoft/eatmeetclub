
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MemoryForm from '@/components/memories/MemoryForm';
import { useMemories } from '@/hooks/useMemories';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CreateMemory = () => {
  const navigate = useNavigate();
  const { createMemory, addMemoryContent } = useMemories();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch restaurants and events for the form dropdowns
    const fetchData = async () => {
      try {
        const [restaurantsResponse, eventsResponse] = await Promise.all([
          supabase.from('restaurants').select('id, name').order('name', { ascending: true }),
          supabase.from('events').select('id, title').order('date', { ascending: false })
        ]);

        if (restaurantsResponse.error) throw restaurantsResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;

        setRestaurants(restaurantsResponse.data || []);
        setEvents(eventsResponse.data || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First create the memory
      const memory = await createMemory({
        title: formData.title,
        location: formData.location,
        date: formData.date,
        privacy: formData.privacy,
        event_id: formData.event_id,
        restaurant_id: formData.restaurant_id,
      });
      
      if (memory && formData.photoUrl) {
        // Then add the photo content if available
        await addMemoryContent(memory.id, {
          content_type: 'photo',
          content_url: formData.photoUrl
        });
      }
      
      // Navigate to memories list on success
      navigate('/dashboard/memories');
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Memory</h1>
        <p className="text-gray-500">
          Capture a special dining moment to share or keep private.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Memory Details</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              restaurants={restaurants}
              events={events}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateMemory;

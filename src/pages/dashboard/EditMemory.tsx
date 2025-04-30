
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MemoryForm from '@/components/memories/MemoryForm';
import { useMemories } from '@/hooks/useMemories';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { Memory } from '@/types/memory';

const EditMemory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateMemory } = useMemories();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryContent, setMemoryContent] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchMemoryDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch memory data
        const { data: memoryData, error: memoryError } = await supabase
          .from('memories')
          .select('*')
          .eq('id', id)
          .single();
          
        if (memoryError) throw memoryError;
        
        // Check if user is memory owner
        if (memoryData.user_id !== user.id) {
          toast({
            title: "Permission denied",
            description: "You don't have permission to edit this memory",
            variant: "destructive"
          });
          navigate('/dashboard/memories');
          return;
        }
        
        setMemory(memoryData);
        
        // Fetch memory content (like photos)
        const { data: contentData, error: contentError } = await supabase
          .from('memory_content')
          .select('*')
          .eq('memory_id', id);
          
        if (contentError) throw contentError;
        setMemoryContent(contentData || []);
        
        // Fetch restaurants and events for dropdowns
        const [restaurantsResponse, eventsResponse] = await Promise.all([
          supabase.from('restaurants').select('id, name').order('name', { ascending: true }),
          supabase.from('events').select('id, title').order('date', { ascending: false })
        ]);

        if (restaurantsResponse.error) throw restaurantsResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;

        setRestaurants(restaurantsResponse.data || []);
        setEvents(eventsResponse.data || []);
      } catch (error: any) {
        console.error('Error fetching memory details:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load memory details',
          variant: 'destructive'
        });
        navigate('/dashboard/memories');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemoryDetails();
  }, [id, navigate, toast, user]);

  const handleUpdateMemory = async (formData: any) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await updateMemory(id, {
        title: formData.title,
        location: formData.location,
        date: formData.date,
        privacy: formData.privacy,
        event_id: formData.event_id || null,
        restaurant_id: formData.restaurant_id || null,
      });
      
      // Add photo if provided (would require additional function to handle replacing photos)
      
      // Navigate back to memory detail view
      navigate(`/dashboard/memories/${id}`);
    } catch (error) {
      console.error('Error updating memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(`/dashboard/memories/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Memory
          </Button>
          <h1 className="text-3xl font-bold ml-4">Edit Memory</h1>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center py-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        ) : memory ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Memory Details</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoryForm
                onSubmit={handleUpdateMemory}
                memory={memory}
                isLoading={isLoading}
                restaurants={restaurants}
                events={events}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-red-500">Memory not found or you don't have permission to edit it.</p>
              <Button onClick={() => navigate("/dashboard/memories")}>
                Back to Memories
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditMemory;

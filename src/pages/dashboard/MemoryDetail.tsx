
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { MemoryWithRelations } from '@/types/memory';
import { useMemories } from '@/hooks/useMemories';
import { useAuth } from '@/hooks/useAuth';
import MemoryDetailHeader from '@/components/memories/detail/MemoryDetailHeader';
import MemoryDeleteDialog from '@/components/memories/detail/MemoryDeleteDialog';
import MemoryInfo from '@/components/memories/detail/MemoryInfo';
import MemoryContent from '@/components/memories/detail/MemoryContent';
import MemoryDishes from '@/components/memories/detail/MemoryDishes';

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteMemory } = useMemories();
  const { user } = useAuth();
  const [memory, setMemory] = useState<MemoryWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchMemoryDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('memories')
          .select(`
            *,
            restaurant:restaurants(*),
            event:events(*)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Fetch related content, attendees, and dishes
        const [contentResult, attendeesResult, dishesResult] = await Promise.all([
          supabase
            .from('memory_content')
            .select('*')
            .eq('memory_id', id)
            .order('created_at', { ascending: true }),
          supabase
            .from('memory_attendees')
            .select('*')
            .eq('memory_id', id),
          supabase
            .from('memory_dishes')
            .select('*')
            .eq('memory_id', id),
        ]);
        
        setMemory({
          ...data,
          content: contentResult.data || [],
          attendees: attendeesResult.data || [],
          dishes: dishesResult.data || [],
        });
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
  }, [id, toast, navigate, user]);

  const handleDelete = async () => {
    if (!id) return;
    
    const success = await deleteMemory(id);
    if (success) {
      navigate('/dashboard/memories');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!memory) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800">Memory not found</h2>
          <p className="mt-2 text-gray-600">The memory you're looking for doesn't exist or you don't have permission to view it.</p>
          <button className="mt-4" onClick={() => navigate('/dashboard/memories')}>
            Back to Memories
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Find the first photo to display
  const photoContent = memory.content?.find(c => c.content_type === 'photo');
  const isOwner = memory.user_id === user?.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MemoryDetailHeader 
          id={memory.id} 
          isOwner={isOwner} 
          onDeleteClick={() => setShowDeleteDialog(true)} 
        />
        
        <MemoryDeleteDialog 
          isOpen={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog} 
          onDelete={handleDelete} 
        />
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{memory.title}</CardTitle>
              <Badge className={
                memory.privacy === 'public' 
                  ? 'bg-green-100 text-green-800' 
                  : memory.privacy === 'private' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-amber-100 text-amber-800'
              }>
                {memory.privacy}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <MemoryContent 
                  photoUrl={photoContent?.content_url} 
                  title={memory.title} 
                />
                
                <MemoryInfo memory={memory} />
              </div>
              
              <MemoryDishes dishes={memory.dishes} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemoryDetail;

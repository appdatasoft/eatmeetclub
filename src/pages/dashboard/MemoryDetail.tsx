
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Share2, Edit, Trash2, Users, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MemoryWithRelations } from '@/types/memory';
import { useMemories } from '@/hooks/useMemories';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

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
          <Button className="mt-4" onClick={() => navigate('/dashboard/memories')}>
            Back to Memories
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Find the first photo to display
  const photoContent = memory.content?.find(c => c.content_type === 'photo');
  const formattedDate = memory.date ? format(new Date(memory.date), 'MMMM d, yyyy') : '';
  
  // Privacy badge color
  const privacyColor = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    unlisted: 'bg-amber-100 text-amber-800',
  }[memory.privacy];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard/memories')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Memories
          </Button>
          
          {memory.user_id === user?.id && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/dashboard/memories/edit/${memory.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete the memory and all associated content.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{memory.title}</CardTitle>
              <Badge className={privacyColor}>
                {memory.privacy}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  {photoContent?.content_url ? (
                    <img 
                      src={photoContent.content_url} 
                      alt={memory.title}
                      className="w-full h-64 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Memory Details</h3>
                    <Separator className="my-2" />
                    
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{formattedDate}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{memory.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{memory.attendees?.length || 0} attendees</span>
                      </div>
                    </div>
                  </div>
                  
                  {memory.restaurant && (
                    <div>
                      <h3 className="text-lg font-medium">Restaurant</h3>
                      <Separator className="my-2" />
                      <p>{memory.restaurant.name}</p>
                      <p className="text-sm text-gray-600">{memory.restaurant.address}, {memory.restaurant.city}</p>
                    </div>
                  )}
                  
                  {memory.event && (
                    <div>
                      <h3 className="text-lg font-medium">Event</h3>
                      <Separator className="my-2" />
                      <p>{memory.event.title}</p>
                      <p className="text-sm text-gray-600">{format(new Date(memory.event.date), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  
                  <Button className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Memory
                  </Button>
                </div>
              </div>
              
              {memory.dishes && memory.dishes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Favorite Dishes</h3>
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {memory.dishes.map(dish => (
                      <Badge key={dish.id} variant="secondary">
                        {dish.dish_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemoryDetail;

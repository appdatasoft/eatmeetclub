
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MemoryList from '@/components/memories/MemoryList';
import { useMemories } from '@/hooks/useMemories';
import { useAuth } from '@/hooks/useAuth';

const Memories = () => {
  const { memories, isLoading, error, fetchMemories } = useMemories();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!user) {
      return;
    }

    // Fetch memories when component mounts
    const loadMemories = async () => {
      if (!isInitialized) {
        try {
          await fetchMemories();
          setIsInitialized(true);
        } catch (err) {
          console.error("Failed to load memories:", err);
          toast({
            title: "Error loading memories",
            description: "Please try again later",
            variant: "destructive"
          });
        }
      }
    };
    
    loadMemories();
  }, [user, isInitialized, fetchMemories]);

  // Show error if there was a problem loading memories
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Your Memories</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            Error loading memories. Please try again later.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Memories</h1>
        <p className="text-gray-500">
          Capture and share your dining experiences with friends and family.
        </p>
        
        <MemoryList memories={memories} isLoading={isLoading || !isInitialized} />
      </div>
    </DashboardLayout>
  );
};

export default Memories;

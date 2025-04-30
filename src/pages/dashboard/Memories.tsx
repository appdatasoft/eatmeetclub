
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MemoryList from '@/components/memories/MemoryList';
import { useMemories } from '@/hooks/useMemories';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Memories = () => {
  const { memories, isLoading } = useMemories();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Memories</h1>
        <p className="text-gray-500">
          Capture and share your dining experiences with friends and family.
        </p>
        
        <MemoryList memories={memories} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Memories;

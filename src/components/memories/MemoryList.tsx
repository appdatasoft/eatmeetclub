
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemoryWithRelations } from '@/types/memory';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemoryCard from './MemoryCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemoryListProps {
  memories: MemoryWithRelations[];
  isLoading: boolean;
}

const MemoryList: React.FC<MemoryListProps> = ({ memories, isLoading }) => {
  const navigate = useNavigate();
  const [filterPrivacy, setFilterPrivacy] = useState<string>('all');
  
  const filteredMemories = memories.filter(memory => {
    if (filterPrivacy === 'all') return true;
    return memory.privacy === filterPrivacy;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Memories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Memories</CardTitle>
          <Button onClick={() => navigate('/dashboard/create-memory')} size="sm">
            <Plus className="mr-1 h-4 w-4" /> New Memory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium mr-2">Filter by:</span>
            <Select
              value={filterPrivacy}
              onValueChange={setFilterPrivacy}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
          </div>
        </div>

        {filteredMemories.length === 0 ? (
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No memories found</h3>
            <p className="text-gray-500 mb-4">Create your first memory to capture special dining moments.</p>
            <Button onClick={() => navigate('/dashboard/create-memory')}>
              <Plus className="mr-1 h-4 w-4" /> Create Memory
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMemories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryList;

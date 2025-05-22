
import { Memory, MemoryDish, MemoryAttendee, MemoryContent } from './memory';

export interface MemoryWithRelations extends Memory {
  dishes?: MemoryDish[];
  attendees?: MemoryAttendee[];
  content?: MemoryContent[];
}

export type MemoryPrivacyType = 'private' | 'public' | 'unlisted';

// Re-export the original types for compatibility
export { Memory, MemoryDish, MemoryAttendee, MemoryContent } from './memory';

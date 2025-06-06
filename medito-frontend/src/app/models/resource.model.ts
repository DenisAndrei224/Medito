import { User } from './user.model';

export interface Resource {
  id: number;
  teacher_id: number; // The ID of the teacher who created this resource
  title: string;
  description: string | null;
  file_path: string | null; // Path relative to storage/app/public/ for files
  url: string | null; // Full URL for links
  type: 'file' | 'link';
  created_at: string;
  updated_at: string;
  // If you load students with the resource (e.g., resource.load('students')), they'd be here:
  students?: User[];
}

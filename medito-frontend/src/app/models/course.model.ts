export interface Course {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
  created_at: string;
  updated_at: string;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    // ... other teacher fields
  };
  modules: any[]; // Or define a proper Module interface
}

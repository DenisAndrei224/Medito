export interface User {
  id: number;
  fullName: string;
  email: string;
  role?: string;
  avatar_url?: string; // This can be stored as a URL or Base64 string
  teacher_id?: number;
}

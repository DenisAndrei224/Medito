export interface Post {
  id: number;
  title: string;
  body: string; // Or 'content' based on your Laravel backend
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    fullName: string;
    avatar_url?: string;
    role?: string;
  };
}

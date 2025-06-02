export interface User {
  id: number;
  fullName: string;
  email: string;
  role?: string;
  avatarUrl?: string; // This can be stored as a URL or Base64 string
}

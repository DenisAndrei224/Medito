export interface IncomingRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  updated_at: string;
  sender: {
    // This comes from the `with('sender:id,fullName,avatar_url')` in Laravel
    id: number;
    fullName: string;
    avatar?: string; // Optional if not always present
  };
}

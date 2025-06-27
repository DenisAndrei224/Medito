export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PusherError extends Error {
  type?: string;
  error?: any;
}

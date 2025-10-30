// src/types/Message.ts

export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  read: boolean;
  unreadCount?: number;
}


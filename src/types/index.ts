import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  about?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastSeen?: Timestamp;
};

export type Chat = {
  id: string;
  participants: string[];
  participantProfiles?: Record<string, Pick<UserProfile, 'displayName' | 'email' | 'photoURL'>>;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt?: Timestamp;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  status?: 'sent' | 'delivered' | 'read';
};

'use client';

import { useEffect, useState } from 'react';
import { subscribeToChats, subscribeToMessages, subscribeToUsers } from '@/firebase/firestore';
import type { Chat, Message, UserProfile } from '@/types';

export function useUsers(currentUid?: string) {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((nextUsers) => {
      setUsers(nextUsers.filter((user) => user.uid !== currentUid));
    });

    return unsubscribe;
  }, [currentUid]);

  return users;
}

export function useChats(uid?: string) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToChats(uid, setChats);
    return unsubscribe;
  }, [uid]);

  return chats;
}

export function useMessages(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  return messages;
}

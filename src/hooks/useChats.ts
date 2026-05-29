'use client';

import { useEffect, useState } from 'react';
import { subscribeToChats, subscribeToMessages, subscribeToUsers } from '@/firebase/firestore';
import type { Chat, Message, UserProfile } from '@/types';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

type RealtimeState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export function useUsers(currentUid?: string) {
  const [state, setState] = useState<RealtimeState<UserProfile[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    if (!currentUid) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    const unsubscribe = subscribeToUsers(
      (nextUsers) => {
        setState({ data: nextUsers.filter((user) => user.uid !== currentUid), loading: false, error: null });
      },
      (error) => setState((current) => ({ ...current, loading: false, error: getFirebaseErrorMessage(error, 'Unable to load users.') }))
    );

    return unsubscribe;
  }, [currentUid]);

  return { users: state.data, loading: state.loading, error: state.error };
}

export function useChats(uid?: string) {
  const [state, setState] = useState<RealtimeState<Chat[]>>({ data: [], loading: Boolean(uid), error: null });

  useEffect(() => {
    if (!uid) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    const unsubscribe = subscribeToChats(
      uid,
      (nextChats) => setState({ data: nextChats, loading: false, error: null }),
      (error) => setState((current) => ({ ...current, loading: false, error: getFirebaseErrorMessage(error, 'Unable to load chats.') }))
    );
    return unsubscribe;
  }, [uid]);

  return { chats: state.data, loading: state.loading, error: state.error };
}

export function useMessages(chatId?: string) {
  const [state, setState] = useState<RealtimeState<Message[]>>({ data: [], loading: Boolean(chatId), error: null });

  useEffect(() => {
    if (!chatId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    const unsubscribe = subscribeToMessages(
      chatId,
      (nextMessages) => setState({ data: nextMessages, loading: false, error: null }),
      (error) => setState((current) => ({ ...current, loading: false, error: getFirebaseErrorMessage(error, 'Unable to load messages.') }))
    );
    return unsubscribe;
  }, [chatId]);

  return { messages: state.data, loading: state.loading, error: state.error };
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatBox from '@/components/ChatBox';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { createChat } from '@/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useChats, useUsers } from '@/hooks/useChats';
import type { Chat, UserProfile } from '@/types';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';
import { getTrustedFirebaseStorageImageUrl } from '@/utils/imageUrls';

export default function ChatPage() {
  const router = useRouter();
  const { user, profile, loading, error: authError } = useAuth();
  const { users, loading: usersLoading, error: usersError } = useUsers(user?.uid);
  const { chats, loading: chatsLoading, error: chatsError } = useChats(user?.uid);
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, router, user]);

  async function handleStartChat(otherUser: UserProfile) {
    if (!profile) return;

    const existingChat = chats.find((chat) => chat.participants.includes(otherUser.uid));
    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    setActionError(null);

    try {
      const chatId = await createChat(profile, otherUser);
      setSelectedChat({
        id: chatId,
        participants: [profile.uid, otherUser.uid].sort(),
        participantProfiles: {
          [profile.uid]: {
            displayName: profile.displayName,
            email: profile.email,
            photoURL: getTrustedFirebaseStorageImageUrl(profile.photoURL) || ''
          },
          [otherUser.uid]: {
            displayName: otherUser.displayName,
            email: otherUser.email,
            photoURL: getTrustedFirebaseStorageImageUrl(otherUser.photoURL) || ''
          }
        }
      });
    } catch (err) {
      setActionError(getFirebaseErrorMessage(err, 'Unable to start this chat.'));
    }
  }

  if (loading || !user) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Loading Varta...</main>;
  }

  return (
    <main className="flex h-screen flex-col bg-slate-100">
      <Navbar />
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 overflow-hidden bg-white shadow-soft md:my-4 md:grid-cols-[380px_1fr] md:rounded-3xl">
        <Sidebar
          currentUser={profile}
          users={users}
          usersLoading={usersLoading}
          chats={chats}
          chatsLoading={chatsLoading}
          error={authError || usersError || chatsError || actionError}
          selectedChatId={selectedChat?.id}
          onStartChat={handleStartChat}
          onSelectChat={setSelectedChat}
        />
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} min-h-0`}>
          <ChatBox chat={selectedChat} currentUser={profile} />
        </div>
      </div>
    </main>
  );
}

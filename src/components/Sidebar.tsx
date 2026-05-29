'use client';

import { Search } from 'lucide-react';
import type { Chat, UserProfile } from '@/types';
import UserCard from './UserCard';

type SidebarProps = {
  currentUser?: UserProfile | null;
  users: UserProfile[];
  usersLoading?: boolean;
  chats: Chat[];
  chatsLoading?: boolean;
  error?: string | null;
  selectedChatId?: string;
  onStartChat: (user: UserProfile) => void;
  onSelectChat: (chat: Chat) => void;
};

export default function Sidebar({
  currentUser,
  users,
  usersLoading,
  chats,
  chatsLoading,
  error,
  selectedChatId,
  onStartChat,
  onSelectChat
}: SidebarProps) {
  const chatUsers = chats.map((chat) => {
    const otherUid = chat.participants.find((participant) => participant !== currentUser?.uid) || '';
    const profile = chat.participantProfiles?.[otherUid];
    return { chat, otherUid, profile };
  });

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white md:max-w-sm">
      <div className="border-b border-slate-100 p-4">
        <h1 className="text-2xl font-black text-slate-900">Chats</h1>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-slate-500">
          <Search size={18} />
          <input className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0" placeholder="Search or start new chat" />
        </div>
      </div>
      <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {error ? <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
        {chatsLoading ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading chats...</p> : null}
        {chatUsers.length ? (
          <div className="space-y-1">
            {chatUsers.map(({ chat, otherUid, profile }) => (
              <UserCard
                key={chat.id}
                active={selectedChatId === chat.id}
                user={{
                  uid: otherUid,
                  displayName: profile?.displayName || 'Varta contact',
                  email: profile?.email || '',
                  photoURL: profile?.photoURL || ''
                }}
                subtitle={chat.lastMessage || 'Tap to continue your conversation'}
                onClick={() => onSelectChat(chat)}
              />
            ))}
          </div>
        ) : (
          !chatsLoading ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No chats yet. Start a conversation below.</p> : null
        )}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h2 className="px-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">People</h2>
          <div className="mt-2 space-y-1">
            {usersLoading ? <p className="px-3 py-2 text-sm text-slate-500">Loading people...</p> : null}
            {users.map((user) => (
              <UserCard key={user.uid} user={user} onClick={() => onStartChat(user)} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

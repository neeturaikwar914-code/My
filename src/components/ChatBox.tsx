'use client';

import { ImagePlus, SendHorizonal, UserRound } from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { sendMessage } from '@/firebase/firestore';
import { uploadChatImage } from '@/firebase/storage';
import { useMessages } from '@/hooks/useChats';
import type { Chat, UserProfile } from '@/types';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';
import MessageBubble from './MessageBubble';
import SafeFirebaseImage from './SafeFirebaseImage';

type ChatBoxProps = {
  chat?: Chat;
  currentUser?: UserProfile | null;
};

export default function ChatBox({ chat, currentUser }: ChatBoxProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(chat?.id);

  const otherUser = useMemo(() => {
    if (!chat || !currentUser) return null;
    const otherUid = chat.participants.find((participant) => participant !== currentUser.uid) || '';
    const profile = chat.participantProfiles?.[otherUid];
    return { uid: otherUid, displayName: profile?.displayName || 'Varta contact', photoURL: profile?.photoURL || '' };
  }, [chat, currentUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat || !currentUser || !text.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendMessage(chat.id, currentUser.uid, { text: text.trim() });
      setText('');
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to send message.'));
    } finally {
      setSending(false);
    }
  }

  async function handleImageUpload(file?: File) {
    if (!file || !chat || !currentUser) return;

    setSending(true);
    setError(null);

    try {
      const imageUrl = await uploadChatImage(chat.id, currentUser.uid, file);
      await sendMessage(chat.id, currentUser.uid, { imageUrl });
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to share image.'));
    } finally {
      setSending(false);
    }
  }

  if (!chat) {
    return (
      <section className="hidden flex-1 items-center justify-center bg-chat-wall bg-chat-pattern bg-[length:18px_18px] p-6 md:flex">
        <div className="max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-soft backdrop-blur">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-varta-100 text-varta-700">
            <SendHorizonal size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">Select a chat</h2>
          <p className="mt-2 text-slate-500">Choose a conversation or start a new one to send realtime messages and photos.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-chat-wall bg-chat-pattern bg-[length:18px_18px]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-varta-100 text-varta-700">
          <SafeFirebaseImage
            src={otherUser?.photoURL}
            alt={otherUser?.displayName || 'Varta contact'}
            fill
            className="object-cover"
            sizes="44px"
            fallback={<UserRound size={20} />}
          />
        </span>
        <div>
          <h2 className="font-black text-slate-900">{otherUser?.displayName || 'Varta contact'}</h2>
          <p className="text-xs text-varta-700">online</p>
        </div>
      </div>
      <div className="chat-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {messagesLoading ? <p className="text-center text-sm text-slate-500">Loading messages...</p> : null}
        {messagesError ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{messagesError}</p> : null}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUser?.uid} />
        ))}
      </div>
      {error ? <p className="mx-3 mb-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageUpload(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-200"
          aria-label="Share image"
        >
          <ImagePlus size={22} />
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-w-0 flex-1 rounded-full border-0 bg-white px-5 py-3 shadow-sm focus:ring-2 focus:ring-varta-500"
          placeholder="Type a message"
        />
        <button
          disabled={sending || !text.trim()}
          className="grid size-11 place-items-center rounded-full bg-varta-600 text-white shadow-sm transition hover:bg-varta-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizonal size={20} />
        </button>
      </form>
    </section>
  );
}

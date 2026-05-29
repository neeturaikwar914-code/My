import Image from 'next/image';
import { CheckCheck } from 'lucide-react';
import type { Message } from '@/types';
import { formatChatTime } from '@/utils/date';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <article
        className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[68%] ${
          isOwn ? 'rounded-br-sm bg-chat-outgoing' : 'rounded-bl-sm bg-chat-incoming'
        }`}
      >
        {message.imageUrl ? (
          <div className="relative mb-2 h-52 w-60 overflow-hidden rounded-xl bg-slate-100">
            <Image src={message.imageUrl} alt="Shared chat image" fill className="object-cover" sizes="240px" />
          </div>
        ) : null}
        {message.text ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{message.text}</p> : null}
        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
          {formatChatTime(message.createdAt)}
          {isOwn ? <CheckCheck size={14} className="text-sky-500" /> : null}
        </div>
      </article>
    </div>
  );
}

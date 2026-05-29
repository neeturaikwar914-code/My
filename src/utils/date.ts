import type { Timestamp } from 'firebase/firestore';

export function formatChatTime(timestamp?: Timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

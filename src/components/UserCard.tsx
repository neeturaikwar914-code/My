import { UserRound } from 'lucide-react';
import type { UserProfile } from '@/types';
import SafeFirebaseImage from './SafeFirebaseImage';

type UserCardProps = {
  user: UserProfile;
  subtitle?: string;
  onClick?: () => void;
  active?: boolean;
};

export default function UserCard({ user, subtitle, onClick, active }: UserCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
        active ? 'bg-varta-100 ring-1 ring-varta-500/20' : 'hover:bg-slate-100'
      }`}
    >
      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-varta-100 text-varta-700">
        <SafeFirebaseImage
          src={user.photoURL}
          alt={user.displayName}
          fill
          className="object-cover"
          sizes="48px"
          fallback={<UserRound size={22} />}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-slate-900">{user.displayName}</span>
        <span className="block truncate text-sm text-slate-500">{subtitle || user.about || user.email}</span>
      </span>
    </button>
  );
}

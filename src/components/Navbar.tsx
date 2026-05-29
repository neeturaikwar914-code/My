'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, MessageCircle, Settings, UserRound } from 'lucide-react';
import { logout } from '@/firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/utils/constants';

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-varta-700">
          <span className="grid size-10 place-items-center rounded-2xl bg-varta-600 text-white shadow-soft">
            <MessageCircle size={22} />
          </span>
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          {user ? (
            <>
              <Link className="hidden rounded-full px-3 py-2 hover:bg-varta-50 sm:inline-flex" href="/chat">
                Chats
              </Link>
              <Link className="rounded-full p-2 hover:bg-varta-50" href="/profile" aria-label="Profile">
                <UserRound size={20} />
              </Link>
              <Link className="rounded-full p-2 hover:bg-varta-50" href="/settings" aria-label="Settings">
                <Settings size={20} />
              </Link>
              <button onClick={handleLogout} className="rounded-full p-2 text-red-500 hover:bg-red-50" aria-label="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link className="rounded-full px-4 py-2 hover:bg-varta-50" href="/login">
                Login
              </Link>
              <Link className="rounded-full bg-varta-600 px-4 py-2 text-white shadow-sm hover:bg-varta-700" href="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

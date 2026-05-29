import Link from 'next/link';
import { MessageCircle, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { APP_NAME, DEMO_FEATURES } from '@/utils/constants';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-varta-50 via-white to-emerald-100">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-varta-700 shadow-sm">Realtime Firebase chat</span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Talk freely with <span className="text-varta-600">{APP_NAME}</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A mobile-first WhatsApp-inspired messenger with secure authentication, profile photos, image sharing, and
            realtime Firestore conversations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="rounded-full bg-varta-600 px-6 py-3 text-center font-bold text-white shadow-soft hover:bg-varta-700">
              Create account
            </Link>
            <Link href="/login" className="rounded-full bg-white px-6 py-3 text-center font-bold text-slate-700 shadow-sm hover:bg-slate-50">
              Login
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {DEMO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
                <ShieldCheck className="text-varta-600" size={20} />
                <span className="font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-4 shadow-soft">
          <div className="overflow-hidden rounded-[1.5rem] bg-chat-wall bg-chat-pattern bg-[length:18px_18px]">
            <div className="flex items-center gap-3 bg-varta-700 p-4 text-white">
              <MessageCircle />
              <div>
                <p className="font-black">Varta Family</p>
                <p className="text-xs text-emerald-100">3 members, 2 online</p>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm">Are we launching Varta today?</div>
              <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-chat-outgoing p-3 shadow-sm">Yes! Auth, chats, images — all ready. ✅</div>
              <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm">The UI feels just like my favorite messenger.</div>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-4">
              <Smartphone className="text-slate-400" />
              <div className="flex-1 rounded-full bg-white px-4 py-3 text-sm text-slate-400">Type a message</div>
              <div className="grid size-11 place-items-center rounded-full bg-varta-600 text-white">
                <Zap size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

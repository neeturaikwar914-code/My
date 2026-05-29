'use client';

import { Bell, LockKeyhole, Moon, Palette } from 'lucide-react';
import Navbar from '@/components/Navbar';

const settings = [
  { icon: Bell, title: 'Notifications', description: 'Message alerts and conversation previews' },
  { icon: LockKeyhole, title: 'Privacy', description: 'Firebase-backed account and chat security' },
  { icon: Palette, title: 'Theme', description: 'WhatsApp-inspired light interface' },
  { icon: Moon, title: 'Quiet hours', description: 'Plan future do-not-disturb preferences' }
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-500">Tune your Varta experience.</p>
          <div className="mt-8 grid gap-3">
            {settings.map((item) => (
              <article key={item.title} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-varta-50 text-varta-700">
                  <item.icon size={22} />
                </span>
                <div>
                  <h2 className="font-black text-slate-900">{item.title}</h2>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Navbar from '@/components/Navbar';
import { registerWithEmail } from '@/firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError('');

    try {
      await registerWithEmail(String(formData.get('email')), String(formData.get('password')), String(formData.get('displayName')));
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-500">Sign up with email and password to start chatting.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input required name="displayName" placeholder="Display name" className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            <input required name="email" type="email" placeholder="Email address" className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            <input required minLength={6} name="password" type="password" placeholder="Password" className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
            <button disabled={loading} className="w-full rounded-2xl bg-varta-600 px-4 py-3 font-bold text-white hover:bg-varta-700 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered? <Link className="font-bold text-varta-700" href="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

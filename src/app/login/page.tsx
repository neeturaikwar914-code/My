'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Navbar from '@/components/Navbar';
import { loginWithEmail, signInWithGoogle } from '@/firebase/auth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError('');

    try {
      await loginWithEmail(String(formData.get('email')), String(formData.get('password')));
      router.push('/chat');
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to login.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/chat');
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to sign in with Google.'));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-500">Login to continue your Varta conversations.</p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="mt-8 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {googleLoading ? 'Opening Google...' : 'Continue with Google'}
          </button>
          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required name="email" type="email" placeholder="Email address" className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            <input required name="password" type="password" placeholder="Password" className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
            <button disabled={loading || googleLoading} className="w-full rounded-2xl bg-varta-600 px-4 py-3 font-bold text-white hover:bg-varta-700 disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            New to Varta? <Link className="font-bold text-varta-700" href="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Camera, UserRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SafeFirebaseImage from '@/components/SafeFirebaseImage';
import { updateUserProfile } from '@/firebase/firestore';
import { uploadProfileImage } from '@/firebase/storage';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, loading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setUploadProgress(null);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(user.uid, {
        displayName: String(formData.get('displayName')),
        about: String(formData.get('about'))
      });
      await refreshProfile();
      setSuccess('Profile updated.');
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to update profile.'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(file?: File) {
    if (!file || !user) return;
    setSaving(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const photoURL = await uploadProfileImage(user.uid, file, setUploadProgress);
      await updateUserProfile(user.uid, { photoURL });
      await refreshProfile();
      setSuccess('Profile photo updated.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Unable to upload profile photo.'));
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  }

  if (loading || !profile) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Loading profile...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-slate-900">Profile</h1>
          <p className="mt-2 text-slate-500">Update your display name, status, and profile image.</p>
          <div className="mt-8 flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="group relative grid size-32 place-items-center overflow-hidden rounded-full bg-varta-100 text-varta-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <SafeFirebaseImage
                src={profile.photoURL}
                alt={profile.displayName}
                fill
                className="object-cover"
                sizes="128px"
                fallback={<UserRound size={42} />}
              />
              <span className="absolute inset-0 grid place-items-center bg-slate-950/45 text-white opacity-0 transition group-hover:opacity-100">
                <Camera />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              disabled={saving}
              onChange={(event) => handlePhoto(event.target.files?.[0])}
            />
          </div>
          {uploadProgress !== null ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <div className="mb-2 flex items-center justify-between">
                <span>Uploading profile photo...</span>
                <span className="font-bold text-varta-700">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-varta-600 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-6 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-6 rounded-2xl bg-varta-50 p-3 text-sm text-varta-700">{success}</p> : null}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-bold text-slate-700">Display name</label>
            <input name="displayName" defaultValue={profile.displayName} className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            <label className="block text-sm font-bold text-slate-700">About</label>
            <textarea name="about" defaultValue={profile.about} className="w-full rounded-2xl border-slate-200 px-4 py-3 focus:border-varta-500 focus:ring-varta-500" />
            <button disabled={saving} className="w-full rounded-2xl bg-varta-600 px-4 py-3 font-bold text-white hover:bg-varta-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

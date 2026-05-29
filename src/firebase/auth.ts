import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { createUserProfile } from './firestore';
import { DEFAULT_ABOUT } from '@/utils/constants';

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user, { displayName, about: DEFAULT_ABOUT });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await createUserProfile(credential.user);
  return credential.user;
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(credential.user, {
    displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'Varta user',
    photoURL: credential.user.photoURL || ''
  });
  return credential.user;
}

export function logout() {
  return signOut(auth);
}

export function getUserDisplayName(user: User | null) {
  return user?.displayName || user?.email?.split('@')[0] || 'Varta user';
}

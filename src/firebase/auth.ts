import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from './config';
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
  return credential.user;
}

export function logout() {
  return signOut(auth);
}

export function getUserDisplayName(user: User | null) {
  return user?.displayName || user?.email?.split('@')[0] || 'Varta user';
}

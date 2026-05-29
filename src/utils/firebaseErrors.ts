import { FirebaseError } from 'firebase/app';

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it completed.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-not-found': 'No account was found for this email address.',
  'auth/weak-password': 'Please choose a password with at least six characters.',
  'permission-denied': 'You do not have permission to perform this action.',
  unauthenticated: 'Please sign in before continuing.'
};

export function getFirebaseErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof FirebaseError) {
    return firebaseErrorMessages[error.code] || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

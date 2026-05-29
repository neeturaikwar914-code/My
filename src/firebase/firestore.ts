import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import type { Chat, Message, UserProfile } from '@/types';

const usersRef = collection(db, 'users');
const chatsRef = collection(db, 'chats');

function getDirectChatId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join('__');
}

export async function createUserProfile(
  user: FirebaseUser,
  data: Partial<Pick<UserProfile, 'displayName' | 'about' | 'photoURL'>> = {}
) {
  const userDoc = doc(usersRef, user.uid);
  const existingUser = await getDoc(userDoc);
  const now = serverTimestamp();
  const profile: Omit<UserProfile, 'createdAt' | 'updatedAt' | 'lastSeen'> = {
    uid: user.uid,
    displayName: data.displayName || user.displayName || user.email?.split('@')[0] || 'Varta user',
    email: user.email || '',
    photoURL: data.photoURL ?? user.photoURL ?? '',
    about: data.about || existingUser.data()?.about || 'Available'
  };

  await setDoc(
    userDoc,
    {
      ...profile,
      createdAt: existingUser.exists() ? existingUser.data().createdAt : now,
      updatedAt: now,
      lastSeen: now
    },
    { merge: true }
  );

  return { ...profile, createdAt: existingUser.data()?.createdAt, updatedAt: undefined } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(usersRef, uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function updateUserPresence(uid: string) {
  await updateDoc(doc(usersRef, uid), {
    lastSeen: serverTimestamp()
  });
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(usersRef, uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    query(usersRef),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((userDoc) => userDoc.data() as UserProfile)
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
      );
    },
    onError
  );
}

export async function createChat(currentUser: UserProfile, otherUser: UserProfile) {
  const chatId = getDirectChatId(currentUser.uid, otherUser.uid);
  const chatDoc = doc(chatsRef, chatId);
  const existingChat = await getDoc(chatDoc);

  if (!existingChat.exists()) {
    await setDoc(chatDoc, {
      participants: [currentUser.uid, otherUser.uid].sort(),
      participantProfiles: {
        [currentUser.uid]: {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL || ''
        },
        [otherUser.uid]: {
          displayName: otherUser.displayName,
          email: otherUser.email,
          photoURL: otherUser.photoURL || ''
        }
      },
      lastMessage: 'Chat started',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  }

  return chatId;
}

export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const chatsQuery = query(chatsRef, where('participants', 'array-contains', uid));
  return onSnapshot(
    chatsQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((chatDoc) => ({ id: chatDoc.id, ...chatDoc.data() }) as Chat)
          .sort((a, b) => (b.lastMessageAt?.toMillis?.() || 0) - (a.lastMessageAt?.toMillis?.() || 0))
      );
    },
    onError
  );
}

export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  return onSnapshot(
    query(messagesRef),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((messageDoc) => ({ id: messageDoc.id, chatId, ...messageDoc.data() }) as Message)
          .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
      );
    },
    onError
  );
}

export async function sendMessage(chatId: string, senderId: string, payload: Pick<Message, 'text' | 'imageUrl'>) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const preview = payload.text || (payload.imageUrl ? '📷 Photo' : 'Message');

  await addDoc(messagesRef, {
    senderId,
    text: payload.text || '',
    imageUrl: payload.imageUrl || '',
    status: 'sent',
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(chatsRef, chatId), {
    lastMessage: preview,
    lastMessageAt: serverTimestamp()
  });
}

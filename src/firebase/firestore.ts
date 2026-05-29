import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './config';
import type { Chat, Message, UserProfile } from '@/types';

const usersRef = collection(db, 'users');
const chatsRef = collection(db, 'chats');

export async function createUserProfile(
  user: FirebaseUser,
  data: Partial<Pick<UserProfile, 'displayName' | 'about' | 'photoURL'>> = {}
) {
  const profile: UserProfile = {
    uid: user.uid,
    displayName: data.displayName || user.displayName || user.email?.split('@')[0] || 'Varta user',
    email: user.email || '',
    photoURL: data.photoURL || user.photoURL || '',
    about: data.about || 'Available',
    createdAt: serverTimestamp() as UserProfile['createdAt'],
    updatedAt: serverTimestamp() as UserProfile['updatedAt']
  };

  await setDoc(doc(usersRef, user.uid), profile, { merge: true });
  return profile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(usersRef, uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(usersRef, uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void): Unsubscribe {
  return onSnapshot(query(usersRef, orderBy('displayName')), (snapshot) => {
    callback(snapshot.docs.map((userDoc) => userDoc.data() as UserProfile));
  });
}

export async function createChat(currentUser: UserProfile, otherUser: UserProfile) {
  const chat = await addDoc(chatsRef, {
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

  return chat.id;
}

export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void): Unsubscribe {
  const chatsQuery = query(chatsRef, where('participants', 'array-contains', uid), orderBy('lastMessageAt', 'desc'));
  return onSnapshot(chatsQuery, (snapshot) => {
    callback(snapshot.docs.map((chatDoc) => ({ id: chatDoc.id, ...chatDoc.data() }) as Chat));
  });
}

export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): Unsubscribe {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.docs.map((messageDoc) => ({ id: messageDoc.id, chatId, ...messageDoc.data() }) as Message));
  });
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

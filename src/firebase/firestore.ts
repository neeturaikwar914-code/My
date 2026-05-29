import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import type { Chat, Message, UserProfile } from '@/types';
import { getTrustedFirebaseStorageImageUrl } from '@/utils/imageUrls';

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
  const safePhotoURL = getTrustedFirebaseStorageImageUrl(data.photoURL ?? user.photoURL) || '';
  const displayName = data.displayName || user.displayName || user.email?.split('@')[0] || 'Varta user';
  const email = user.email || '';

  return runTransaction(db, async (transaction) => {
    const existingUser = await transaction.get(userDoc);
    const now = serverTimestamp();

    if (existingUser.exists()) {
      const existingProfile = existingUser.data() as UserProfile;
      const updates: Partial<UserProfile> = {
        uid: user.uid,
        displayName,
        email,
        updatedAt: now as UserProfile['updatedAt'],
        lastSeen: now as UserProfile['lastSeen']
      };

      if (safePhotoURL) {
        updates.photoURL = safePhotoURL;
      }

      if (data.about) {
        updates.about = data.about;
      }

      transaction.set(userDoc, updates, { merge: true });

      return {
        ...existingProfile,
        ...updates,
        photoURL: updates.photoURL ?? existingProfile.photoURL ?? '',
        about: updates.about ?? existingProfile.about ?? 'Available'
      } as UserProfile;
    }

    const profile: UserProfile = {
      uid: user.uid,
      displayName,
      email,
      photoURL: safePhotoURL,
      about: data.about || 'Available',
      createdAt: now as UserProfile['createdAt'],
      updatedAt: now as UserProfile['updatedAt'],
      lastSeen: now as UserProfile['lastSeen']
    };

    transaction.set(userDoc, profile);
    return profile;
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const nextData = { ...data };

  if ('photoURL' in nextData) {
    nextData.photoURL = nextData.photoURL ? getTrustedFirebaseStorageImageUrl(nextData.photoURL) || '' : '';
  }

  await updateDoc(doc(usersRef, uid), {
    ...nextData,
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

function uniqueUsersByUid(users: UserProfile[]) {
  const uniqueUsers = new Map<string, UserProfile>();

  for (const user of users) {
    if (!user.uid || uniqueUsers.has(user.uid)) continue;
    uniqueUsers.set(user.uid, user);
  }

  return Array.from(uniqueUsers.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    query(usersRef),
    (snapshot) => {
      callback(
        uniqueUsersByUid(
          snapshot.docs
            .map((userDoc) => ({ id: userDoc.id, profile: userDoc.data() as UserProfile }))
            .filter(({ id, profile }) => id === profile.uid)
            .map(({ profile }) => profile)
        )
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
          photoURL: getTrustedFirebaseStorageImageUrl(currentUser.photoURL) || ''
        },
        [otherUser.uid]: {
          displayName: otherUser.displayName,
          email: otherUser.email,
          photoURL: getTrustedFirebaseStorageImageUrl(otherUser.photoURL) || ''
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
  const safeImageUrl = payload.imageUrl ? getTrustedFirebaseStorageImageUrl(payload.imageUrl) : '';

  if (payload.imageUrl && !safeImageUrl) {
    throw new Error('Only trusted Firebase Storage image URLs can be shared.');
  }

  const preview = payload.text || (safeImageUrl ? '📷 Photo' : 'Message');

  await addDoc(messagesRef, {
    senderId,
    text: payload.text || '',
    imageUrl: safeImageUrl || '',
    status: 'sent',
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(chatsRef, chatId), {
    lastMessage: preview,
    lastMessageAt: serverTimestamp()
  });
}

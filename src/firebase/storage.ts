import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

export async function uploadProfileImage(uid: string, file: File) {
  const imageRef = ref(storage, `profiles/${uid}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(imageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadChatImage(chatId: string, uid: string, file: File) {
  const imageRef = ref(storage, `chats/${chatId}/${uid}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(imageRef, file);
  return getDownloadURL(snapshot.ref);
}

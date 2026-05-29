import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function assertImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Images must be smaller than 5 MB.');
  }
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

export async function uploadProfileImage(uid: string, file: File) {
  assertImageFile(file);
  const imageRef = ref(storage, `profiles/${uid}/${Date.now()}-${safeFileName(file.name)}`);
  const snapshot = await uploadBytes(imageRef, file, {
    contentType: file.type,
    customMetadata: { owner: uid }
  });
  return getDownloadURL(snapshot.ref);
}

export async function uploadChatImage(chatId: string, uid: string, file: File) {
  assertImageFile(file);
  const imageRef = ref(storage, `chats/${chatId}/${uid}/${Date.now()}-${safeFileName(file.name)}`);
  const snapshot = await uploadBytes(imageRef, file, {
    contentType: file.type,
    customMetadata: { owner: uid, chatId }
  });
  return getDownloadURL(snapshot.ref);
}

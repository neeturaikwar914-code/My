import { getDownloadURL, ref, uploadBytesResumable, type UploadTaskSnapshot } from 'firebase/storage';
import { storage } from './firebase';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const IMAGE_EXTENSIONS_TO_CONTENT_TYPE: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};

export type UploadProgressHandler = (progress: number) => void;

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function getSupportedImageContentType(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return file.type;
  return IMAGE_EXTENSIONS_TO_CONTENT_TYPE[getFileExtension(file.name)] || null;
}

export function validateImageFile(file: File) {
  const contentType = getSupportedImageContentType(file);

  if (!contentType) {
    throw new Error('Please choose a JPG, PNG, WebP, GIF, or AVIF image.');
  }

  if (file.size <= 0) {
    throw new Error('The selected image is empty. Please choose another image.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Images must be smaller than 5 MB.');
  }

  return contentType;
}

function safeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${baseName || 'image'}.${extension || 'jpg'}`;
}

function createUploadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function uploadImage(path: string, uid: string, file: File, onProgress?: UploadProgressHandler) {
  const contentType = validateImageFile(file);
  const imageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(imageRef, file, {
    cacheControl: 'public,max-age=31536000,immutable',
    contentType,
    customMetadata: { owner: uid }
  });

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(uploadTask.snapshot.ref));
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

export async function uploadProfileImage(uid: string, file: File, onProgress?: UploadProgressHandler) {
  const path = `profiles/${uid}/${createUploadId()}-${safeFileName(file.name)}`;
  return uploadImage(path, uid, file, onProgress);
}

export async function uploadChatImage(chatId: string, uid: string, file: File, onProgress?: UploadProgressHandler) {
  const path = `chats/${chatId}/${uid}/${createUploadId()}-${safeFileName(file.name)}`;
  return uploadImage(path, uid, file, onProgress);
}

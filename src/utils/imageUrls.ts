const TRUSTED_FIREBASE_STORAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'varta-2f722.firebasestorage.app'
]);

const TRUSTED_FIREBASE_BUCKETS = new Set([
  'varta-2f722.firebasestorage.app',
  'varta-2f722.appspot.com'
]);

function isTrustedFirebaseStorageUrl(url: URL) {
  if (url.protocol !== 'https:') return false;
  if (!TRUSTED_FIREBASE_STORAGE_HOSTS.has(url.hostname)) return false;

  if (url.hostname === 'firebasestorage.googleapis.com') {
    const [, version, bucketMarker, bucketName, objectMarker] = url.pathname.split('/');
    return version === 'v0' && bucketMarker === 'b' && TRUSTED_FIREBASE_BUCKETS.has(bucketName) && objectMarker === 'o';
  }

  return url.hostname === 'varta-2f722.firebasestorage.app' && url.pathname.startsWith('/');
}

export function getTrustedFirebaseStorageImageUrl(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return isTrustedFirebaseStorageUrl(url) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isTrustedFirebaseStorageImageUrl(value?: string | null) {
  return Boolean(getTrustedFirebaseStorageImageUrl(value));
}

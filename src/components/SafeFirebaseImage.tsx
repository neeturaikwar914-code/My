'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTrustedFirebaseStorageImageUrl } from '@/utils/imageUrls';

type SafeFirebaseImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallback?: ReactNode;
};

export default function SafeFirebaseImage({ src, alt, fallback = null, onError, ...props }: SafeFirebaseImageProps) {
  const safeSrc = useMemo(() => getTrustedFirebaseStorageImageUrl(src), [src]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safeSrc]);

  if (!safeSrc || failed) return <>{fallback}</>;

  return (
    <Image
      {...props}
      src={safeSrc}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}

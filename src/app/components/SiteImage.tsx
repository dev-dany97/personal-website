import Image, { type ImageProps } from 'next/image';

// next/image with a safeguard for content from the database: only local
// images (path starting with "/") go through image optimisation. External URLs, e.g.
// from the Valorant API, load unchanged and therefore need no
// Eintrag in images.remotePatterns.
export function SiteImage({ unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  const local = src === '' || (src.startsWith('/') && !src.startsWith('//'));
  // eslint-disable-next-line jsx-a11y/alt-text -- alt comes in via props
  return <Image {...props} unoptimized={unoptimized ?? !local} />;
}

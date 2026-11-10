import Image, { type ImageProps } from 'next/image';

// next/image mit einer Absicherung für Inhalte aus der Datenbank: Nur eigene
// Bilder (Pfad mit "/") laufen durch die Bildoptimierung. Fremde URLs, etwa
// von der Valorant-API, werden unverändert geladen und brauchen deshalb keinen
// Eintrag in images.remotePatterns.
export function SiteImage({ unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  const local = src === '' || (src.startsWith('/') && !src.startsWith('//'));
  // eslint-disable-next-line jsx-a11y/alt-text -- alt kommt über die Props
  return <Image {...props} unoptimized={unoptimized ?? !local} />;
}

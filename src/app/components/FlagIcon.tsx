import type { ReactElement } from 'react';

type CountryCode = 'IT' | 'AE' | 'TH' | 'FR' | 'ES' | 'HR' | 'AU';

const FLAGS: Record<CountryCode, ReactElement> = {
  IT: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="6.67" height="14" fill="#009246" />
      <rect x="13.33" width="6.67" height="14" fill="#ce2b37" />
    </>
  ),
  FR: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="6.67" height="14" fill="#0055a4" />
      <rect x="13.33" width="6.67" height="14" fill="#ef4135" />
    </>
  ),
  ES: (
    <>
      <rect width="20" height="14" fill="#aa151b" />
      <rect y="3.5" width="20" height="7" fill="#f1bf00" />
    </>
  ),
  TH: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="20" height="2.8" fill="#a51931" />
      <rect y="11.2" width="20" height="2.8" fill="#a51931" />
      <rect y="2.8" width="20" height="2.8" fill="#2d2a4a" />
      <rect y="8.4" width="20" height="2.8" fill="#2d2a4a" />
      <rect y="5.6" width="20" height="2.8" fill="#f4f5f8" />
    </>
  ),
  AE: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect y="0" width="20" height="4.67" fill="#00732f" />
      <rect y="9.33" width="20" height="4.67" fill="#000" />
      <rect width="6" height="14" fill="#ff0000" />
    </>
  ),
  HR: (
    <>
      <rect width="20" height="4.67" fill="#ff0000" />
      <rect y="4.67" width="20" height="4.67" fill="#fff" />
      <rect y="9.33" width="20" height="4.67" fill="#171796" />
    </>
  ),
  AU: (
    <>
      <rect width="20" height="14" fill="#00247d" />
      <g fill="#fff">
        <circle cx="15.2" cy="3" r="0.8" />
        <circle cx="16.6" cy="6" r="0.9" />
        <circle cx="15" cy="9.2" r="0.7" />
        <circle cx="12.4" cy="7.4" r="0.6" />
        <circle cx="17.8" cy="9.6" r="0.5" />
      </g>
      <g stroke="#fff" strokeWidth="1.4">
        <path d="M0 0 L8 5.5 M8 0 L0 5.5" />
      </g>
      <rect width="8" height="5.5" fill="#00247d" stroke="#fff" strokeWidth="0.4" />
      <path d="M4 0 V5.5 M0 2.75 H8" stroke="#fff" strokeWidth="0.9" />
      <path d="M4 0 V5.5 M0 2.75 H8" stroke="#cf142b" strokeWidth="0.35" />
    </>
  )
};

export function FlagIcon({ country, size = 18 }: { country: CountryCode; size?: number }) {
  const flag = FLAGS[country];
  if (!flag) return null;
  return (
    <svg
      viewBox="0 0 20 14"
      width={size}
      height={(size * 14) / 20}
      aria-hidden="true"
      style={{ display: 'inline-block', borderRadius: '2px', boxShadow: '0 0 0 1px rgba(255,255,255,0.15)', verticalAlign: 'middle' }}
    >
      {flag}
    </svg>
  );
}

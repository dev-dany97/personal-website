'use client';

export function PigeonBackground() {
  return (
    <div className="pigeon-bg" aria-hidden="true">
      <svg className="pigeon-fly" viewBox="0 0 64 64" width="56" height="56">
        <line x1="47" y1="33" x2="47" y2="42" className="pigeon-string" />
        <rect x="43" y="41" width="8" height="6" rx="0.5" className="pigeon-letter" />
        <polygon points="18,34 6,27 6,41" className="pigeon-tail" />
        <path
          className="pigeon-wing"
          d="M30,31 Q14,10 1,19 Q10,26 22,31 Q26,33 30,31 Z"
        />
        <ellipse cx="32" cy="33" rx="15" ry="6.5" className="pigeon-body" />
        <circle cx="47" cy="27" r="5" className="pigeon-body" />
        <polygon points="51,27 57,25 51,29" className="pigeon-body" />
        <circle cx="49" cy="26" r="0.9" className="pigeon-eye" />
      </svg>
    </div>
  );
}

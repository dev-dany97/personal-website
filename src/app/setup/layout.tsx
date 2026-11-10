import { JetBrains_Mono, Onest, Tektur } from 'next/font/google';
import './gaming.css';

// next/font lädt die Schriften beim Build herunter und liefert sie von der
// eigenen Domain aus. Es gibt also keine Anfrage an Google-Server (DSGVO).
const display = Tektur({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-gx-display', display: 'swap' });
const body = Onest({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-gx-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-gx-mono', display: 'swap' });

export default function SetupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>;
}

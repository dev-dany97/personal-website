import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/app/providers";
import { CookieBanner } from "@/app/components/CookieBanner";
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Mohles",
  description: "Welcome to my portfolio. Explore my projects, PC setup, finance insights, and travel stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

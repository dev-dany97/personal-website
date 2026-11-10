import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/app/providers";
import { CookieBanner } from "@/app/components/CookieBanner";
import { ScrollToTopButton } from "@/app/components/ScrollToTopButton";
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Mohles",
  description: "Welcome to my portfolio. Explore my projects, PC setup, finance insights, and travel stories.",
};

const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

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
          <ScrollToTopButton />
        </Providers>
        {umamiSrc && umamiWebsiteId && (
          <Script
            src={umamiSrc}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

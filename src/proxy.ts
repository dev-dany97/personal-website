import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limit for the content API — this runs on a single
// long-lived server process (not serverless), so an in-memory map is fine.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

// The site is only reachable through CloudFront, which sets
// CloudFront-Viewer-Address ("ip:port") itself and cannot be spoofed by the
// client. X-Forwarded-For is a fallback: its *first* entry is whatever the
// client sent, so we take the last entry, which was appended by our own proxy.
export function clientIp(req: NextRequest): string {
  const viewer = req.headers.get('cloudfront-viewer-address');
  if (viewer) {
    const idx = viewer.lastIndexOf(':');
    return (idx > 0 ? viewer.slice(0, idx) : viewer).trim();
  }
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export function proxy(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Periodically drop stale entries so the map doesn't grow forever.
  if (hits.size > 5000) {
    hits.forEach((value, key) => {
      if (now > value.resetAt) hits.delete(key);
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};

import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function requestFrom(ip: string) {
  return new NextRequest('http://localhost/api/contact', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('proxy rate limiting', () => {
  it('allows requests under the limit', () => {
    const ip = `1.1.1.${Math.random()}`;
    const res = proxy(requestFrom(ip));
    expect(res.status).toBe(200);
  });

  it('blocks an ip once it exceeds the limit within the window', () => {
    const ip = `2.2.2.${Math.random()}`;
    let last;
    for (let i = 0; i < 121; i++) {
      last = proxy(requestFrom(ip));
    }
    expect(last!.status).toBe(429);
  });

  it('resets the count for an ip once the window has passed', () => {
    const ip = `3.3.3.${Math.random()}`;
    vi.setSystemTime(0);
    for (let i = 0; i < 121; i++) {
      proxy(requestFrom(ip));
    }
    expect(proxy(requestFrom(ip)).status).toBe(429);

    vi.setSystemTime(60_001);
    expect(proxy(requestFrom(ip)).status).toBe(200);
    vi.useRealTimers();
  });

  it('tracks separate ips independently', () => {
    const ipA = `4.4.4.${Math.random()}`;
    const ipB = `5.5.5.${Math.random()}`;
    for (let i = 0; i < 121; i++) {
      proxy(requestFrom(ipA));
    }
    expect(proxy(requestFrom(ipA)).status).toBe(429);
    expect(proxy(requestFrom(ipB)).status).toBe(200);
  });
});

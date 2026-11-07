import { describe, expect, it } from 'vitest';
import { resolveTextPlaceholders } from './text-placeholders';

describe('resolveTextPlaceholders', () => {
  it('replaces yearsSince with the years since the given year', () => {
    const text = 'seit {yearsSince:2020} Jahren';
    expect(resolveTextPlaceholders(text, new Date('2026-11-07'))).toBe('seit 6 Jahren');
    expect(resolveTextPlaceholders(text, new Date('2027-01-01'))).toBe('seit 7 Jahren');
  });

  it('leaves text without placeholders unchanged', () => {
    expect(resolveTextPlaceholders('Raspberry Pi 5')).toBe('Raspberry Pi 5');
  });
});

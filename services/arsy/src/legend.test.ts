import { describe, expect, test } from 'bun:test';
import { isAuthorizedBearer } from './legend';

const TOKEN = 'arsy-service-token-0123456789abcdef0123';

describe('ARSY bearer authorization', () => {
  test('accepts the exact configured token', () => {
    expect(isAuthorizedBearer(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
  });

  test('rejects missing, malformed and mismatched tokens', () => {
    expect(isAuthorizedBearer(undefined, TOKEN)).toBe(false);
    expect(isAuthorizedBearer(TOKEN, TOKEN)).toBe(false);
    expect(isAuthorizedBearer(`Bearer ${TOKEN}x`, TOKEN)).toBe(false);
    expect(isAuthorizedBearer(`Bearer ${TOKEN.replace('a', 'b')}`, TOKEN)).toBe(false);
  });

  test('rejects everything when server token is weak or unset', () => {
    expect(isAuthorizedBearer('Bearer short', 'short')).toBe(false);
    expect(isAuthorizedBearer('Bearer ', '')).toBe(false);
  });
});


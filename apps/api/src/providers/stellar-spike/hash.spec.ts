import { canonicalize, hashCredential, sortKeys } from './hash';

describe('hash canonicalization', () => {
  it('sorts object keys recursively', () => {
    const input = { b: 1, a: { d: 2, c: 3 }, z: [1, 2] };
    expect(sortKeys(input)).toEqual({
      a: { c: 3, d: 2 },
      b: 1,
      z: [1, 2],
    });
  });

  it('produces stable canonical JSON regardless of key order', () => {
    const a = canonicalize({ b: 1, a: 2 });
    const b = canonicalize({ a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"b":1}');
  });

  it('hashes the same credential body to the same digest', () => {
    const body = {
      id: 'urn:uuid:test',
      type: ['VerifiableCredential'],
      issuer: 'did:key:zTest',
      credentialSubject: { id: 'did:key:zHolder', achievement: 'X' },
    };
    const shuffled = {
      credentialSubject: { achievement: 'X', id: 'did:key:zHolder' },
      issuer: 'did:key:zTest',
      type: ['VerifiableCredential'],
      id: 'urn:uuid:test',
    };
    expect(hashCredential(body).hex).toBe(hashCredential(shuffled).hex);
    expect(hashCredential(body).bytes).toEqual(hashCredential(shuffled).bytes);
  });
});

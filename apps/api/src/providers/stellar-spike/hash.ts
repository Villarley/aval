import { createHash } from 'crypto';

/** Recursively sort object keys for stable JSON serialization. */
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

/** Canonical JSON string with stable key ordering. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

/** SHA-256 of canonicalized JSON; returns hex string and raw bytes. */
export function hashCredential(credentialWithoutProof: unknown): {
  hex: string;
  bytes: Buffer;
} {
  const canonical = canonicalize(credentialWithoutProof);
  const bytes = createHash('sha256').update(canonical, 'utf8').digest();
  return { hex: bytes.toString('hex'), bytes };
}

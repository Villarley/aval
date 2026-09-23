/**
 * did:key utilities for Stellar Ed25519 public keys.
 * Spec: https://w3c-ccg.github.io/did-key-spec/
 * Multicodec ed25519-pub prefix: 0xed01
 */
import { StrKey } from '@stellar/stellar-sdk';
import bs58 from 'bs58';

const ED25519_PUB_PREFIX = Buffer.from([0xed, 0x01]);

/** Derive a did:key DID from a Stellar account public key (G...). */
export function stellarPublicKeyToDidKey(publicKey: string): string {
  const raw = Buffer.from(StrKey.decodeEd25519PublicKey(publicKey));
  const multicodec = Buffer.concat([ED25519_PUB_PREFIX, raw]);
  return `did:key:z${bs58.encode(multicodec)}`;
}

/** Recover the Stellar public key (G...) from a did:key DID. */
export function didKeyToStellarPublicKey(did: string): string {
  if (!did.startsWith('did:key:z')) {
    throw new Error(`Unsupported DID (expected did:key:z...): ${did}`);
  }
  const multibase = did.slice('did:key:'.length); // z...
  const decoded = Buffer.from(bs58.decode(multibase.slice(1)));
  if (decoded.length < 34 || decoded[0] !== 0xed || decoded[1] !== 0x01) {
    throw new Error('did:key is not an Ed25519 public key');
  }
  const raw = decoded.subarray(2, 34);
  return StrKey.encodeEd25519PublicKey(raw);
}

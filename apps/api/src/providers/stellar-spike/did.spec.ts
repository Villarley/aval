import { Keypair } from '@stellar/stellar-sdk';
import { didKeyToStellarPublicKey, stellarPublicKeyToDidKey } from './did';

describe('did:key round trip', () => {
  it('converts Stellar public key to did:key and back', () => {
    const kp = Keypair.random();
    const did = stellarPublicKeyToDidKey(kp.publicKey());
    expect(did.startsWith('did:key:z')).toBe(true);
    expect(didKeyToStellarPublicKey(did)).toBe(kp.publicKey());
  });

  it('rejects unsupported DID schemes', () => {
    expect(() => didKeyToStellarPublicKey('did:web:example.com')).toThrow(
      /Unsupported DID/,
    );
  });
});

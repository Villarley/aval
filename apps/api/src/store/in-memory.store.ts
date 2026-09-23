import { Injectable } from '@nestjs/common';
import type { Holder, VerifiableCredential } from '@mi-billetera/shared';

/**
 * Demo-only in-memory persistence.
 * Data is lost on process restart. Replace with a real DB (and Cavos for keys) later.
 */
export interface StoredHolder extends Holder {
  /** Server-side Stellar secret for this demo. TODO: real wallet layer (Cavos) owns keys. */
  secret: string;
}

export interface StoredCredential {
  holderId: string;
  credential: VerifiableCredential;
  anchorTxHash: string;
  issuerName: string;
}

export interface StoredShare {
  token: string;
  credentialId: string;
  expiresAt: Date;
}

@Injectable()
export class InMemoryStore {
  /** holderId -> holder (including secret) */
  readonly holders = new Map<string, StoredHolder>();

  /** credential id (urn:uuid:... or cred:...) -> stored credential */
  readonly credentials = new Map<string, StoredCredential>();

  /** share token -> share metadata */
  readonly shares = new Map<string, StoredShare>();

  findCredentialById(credentialId: string): StoredCredential | undefined {
    const direct = this.credentials.get(credentialId);
    if (direct) return direct;

    for (const [key, value] of this.credentials) {
      if (
        key === credentialId ||
        value.credential.id === credentialId ||
        value.credential.proof?.credentialId === credentialId
      ) {
        return value;
      }
    }
    return undefined;
  }

  credentialsForHolder(holderId: string): StoredCredential[] {
    return [...this.credentials.values()].filter((c) => c.holderId === holderId);
  }
}

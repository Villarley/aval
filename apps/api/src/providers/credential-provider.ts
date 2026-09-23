import type {
  CredentialClaims,
  VerifiableCredential,
  VerificationResult,
} from '@mi-billetera/shared';

/** Abstraction over credential issue / verify / revoke backends. */
export interface CredentialProvider {
  readonly name: string;
  issue(input: {
    holderPublicKey: string;
    claims: CredentialClaims;
  }): Promise<{ credential: VerifiableCredential; anchorTxHash: string }>;
  verify(credential: VerifiableCredential): Promise<VerificationResult>;
  revoke(credentialId: string): Promise<{ revocationTxHash: string }>;
  issuerDid(): string;
}

/** DI token for the active CredentialProvider implementation. */
export const CREDENTIAL_PROVIDER = Symbol('CREDENTIAL_PROVIDER');

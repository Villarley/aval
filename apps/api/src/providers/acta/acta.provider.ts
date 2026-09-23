import { Injectable, NotImplementedException } from '@nestjs/common';
import type {
  CredentialClaims,
  VerifiableCredential,
  VerificationResult,
} from '@mi-billetera/shared';
import type { CredentialProvider } from '../credential-provider';

/** Stub for the real acta.build CredentialProvider (not implemented yet). */
@Injectable()
export class ActaProvider implements CredentialProvider {
  readonly name = 'acta';

  issue(_input: {
    holderPublicKey: string;
    claims: CredentialClaims;
  }): Promise<{ credential: VerifiableCredential; anchorTxHash: string }> {
    throw new NotImplementedException(
      'ACTA integration pending, see docs/decisions/0002-credential-provider.md',
    );
  }

  verify(_credential: VerifiableCredential): Promise<VerificationResult> {
    throw new NotImplementedException(
      'ACTA integration pending, see docs/decisions/0002-credential-provider.md',
    );
  }

  revoke(_credentialId: string): Promise<{ revocationTxHash: string }> {
    throw new NotImplementedException(
      'ACTA integration pending, see docs/decisions/0002-credential-provider.md',
    );
  }

  issuerDid(): string {
    throw new NotImplementedException(
      'ACTA integration pending, see docs/decisions/0002-credential-provider.md',
    );
  }
}

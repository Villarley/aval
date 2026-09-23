import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IssueCredentialRequest,
  IssueCredentialResponse,
  RevokeCredentialRequest,
  RevokeCredentialResponse,
  VerifyCredentialRequest,
  VerifyCredentialResponse,
} from '@mi-billetera/shared';
import {
  CREDENTIAL_PROVIDER,
  type CredentialProvider,
} from '../providers/credential-provider';
import { explorerUrl } from '../common/explorer';
import { InMemoryStore } from '../store/in-memory.store';

const DEFAULT_ISSUER_NAME = 'Mi Billetera Issuer';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly store: InMemoryStore,
    @Inject(CREDENTIAL_PROVIDER)
    private readonly provider: CredentialProvider,
  ) {}

  async issue(body: IssueCredentialRequest): Promise<IssueCredentialResponse> {
    if (!body?.holderId || typeof body.holderId !== 'string') {
      throw new BadRequestException('holderId is required');
    }
    if (!body.claims || typeof body.claims !== 'object') {
      throw new BadRequestException('claims is required');
    }
    const { achievement, institution, issuedToName } = body.claims;
    if (!achievement || !institution || !issuedToName) {
      throw new BadRequestException(
        'claims.achievement, claims.institution, and claims.issuedToName are required',
      );
    }

    const holder = this.store.holders.get(body.holderId);
    if (!holder) {
      throw new NotFoundException(`Holder not found: ${body.holderId}`);
    }

    const { credential, anchorTxHash } = await this.provider.issue({
      holderPublicKey: holder.publicKey,
      claims: body.claims,
    });

    const issuerName = DEFAULT_ISSUER_NAME;
    this.store.credentials.set(credential.id, {
      holderId: holder.id,
      credential,
      anchorTxHash,
      issuerName,
    });

    return {
      credential,
      anchorTxHash,
      explorerUrl: explorerUrl(anchorTxHash),
    };
  }

  async verify(body: VerifyCredentialRequest): Promise<VerifyCredentialResponse> {
    if (!body?.credential || typeof body.credential !== 'object') {
      throw new BadRequestException('credential is required');
    }
    return this.provider.verify(body.credential);
  }

  async revoke(body: RevokeCredentialRequest): Promise<RevokeCredentialResponse> {
    if (!body?.credentialId || typeof body.credentialId !== 'string') {
      throw new BadRequestException('credentialId is required');
    }

    const stored = this.store.findCredentialById(body.credentialId);
    if (!stored) {
      throw new NotFoundException(`Credential not found: ${body.credentialId}`);
    }

    const id =
      stored.credential.proof?.credentialId ??
      stored.credential.id ??
      body.credentialId;

    const { revocationTxHash } = await this.provider.revoke(id);
    return {
      revocationTxHash,
      explorerUrl: explorerUrl(revocationTxHash),
    };
  }
}

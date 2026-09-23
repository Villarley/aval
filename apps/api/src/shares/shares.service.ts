import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type {
  CreateShareRequest,
  CreateShareResponse,
  GetShareResponse,
} from '@mi-billetera/shared';
import {
  CREDENTIAL_PROVIDER,
  type CredentialProvider,
} from '../providers/credential-provider';
import { InMemoryStore } from '../store/in-memory.store';

const SHARE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class SharesService {
  constructor(
    private readonly store: InMemoryStore,
    @Inject(CREDENTIAL_PROVIDER)
    private readonly provider: CredentialProvider,
  ) {}

  create(body: CreateShareRequest): CreateShareResponse {
    if (!body?.credentialId || typeof body.credentialId !== 'string') {
      throw new BadRequestException('credentialId is required');
    }

    const stored = this.store.findCredentialById(body.credentialId);
    if (!stored) {
      throw new NotFoundException(`Credential not found: ${body.credentialId}`);
    }

    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + SHARE_TTL_MS);
    const walletUrl = process.env.WALLET_URL ?? 'http://localhost:5173';

    this.store.shares.set(token, {
      token,
      credentialId: stored.credential.id,
      expiresAt,
    });

    return {
      token,
      verifyUrl: `${walletUrl}/verificar/${token}`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async get(token: string): Promise<GetShareResponse> {
    const share = this.store.shares.get(token);
    if (!share || share.expiresAt.getTime() < Date.now()) {
      if (share) {
        this.store.shares.delete(token);
      }
      throw new NotFoundException('Share not found or expired');
    }

    const stored = this.store.findCredentialById(share.credentialId);
    if (!stored) {
      throw new NotFoundException('Credential for share not found');
    }

    const verification = await this.provider.verify(stored.credential);
    return {
      credential: stored.credential,
      verification,
      issuerName: stored.issuerName,
    };
  }
}

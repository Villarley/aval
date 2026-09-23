import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import type {
  CreateHolderRequest,
  ListHolderCredentialsResponse,
  WalletCredential,
} from '@mi-billetera/shared';
import {
  CREDENTIAL_PROVIDER,
  type CredentialProvider,
} from '../providers/credential-provider';
import { explorerUrl } from '../common/explorer';
import { InMemoryStore } from '../store/in-memory.store';
import { HoldersService } from './holders.service';

@Controller('holders')
export class HoldersController {
  constructor(
    private readonly holdersService: HoldersService,
    private readonly store: InMemoryStore,
    @Inject(CREDENTIAL_PROVIDER)
    private readonly provider: CredentialProvider,
  ) {}

  @Post()
  create(@Body() body: CreateHolderRequest) {
    return this.holdersService.create(body);
  }

  @Get(':id/credentials')
  async listCredentials(
    @Param('id') id: string,
  ): Promise<ListHolderCredentialsResponse> {
    const holder = this.holdersService.get(id);
    const stored = this.store.credentialsForHolder(id);

    const credentials: WalletCredential[] = [];
    for (const item of stored) {
      const verification = await this.provider.verify(item.credential);
      let status: WalletCredential['status'] = 'unknown';
      if (verification.valid) {
        status = 'valid';
      } else if (verification.reason === 'revoked' || !verification.checks.notRevoked) {
        status = 'revoked';
      }

      credentials.push({
        credential: item.credential,
        status,
        anchorTxHash: item.anchorTxHash,
        explorerUrl: explorerUrl(item.anchorTxHash),
        issuerName: item.issuerName,
      });
    }

    return { holder, credentials };
  }
}

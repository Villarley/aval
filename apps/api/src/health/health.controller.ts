import { Controller, Get, Inject } from '@nestjs/common';
import {
  CREDENTIAL_PROVIDER,
  type CredentialProvider,
} from '../providers/credential-provider';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(CREDENTIAL_PROVIDER)
    private readonly provider: CredentialProvider,
  ) {}

  @Get()
  getHealth() {
    return { ok: true, provider: this.provider.name };
  }
}

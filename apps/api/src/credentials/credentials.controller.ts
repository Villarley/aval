import { Body, Controller, Post } from '@nestjs/common';
import type {
  IssueCredentialRequest,
  RevokeCredentialRequest,
  VerifyCredentialRequest,
} from '@mi-billetera/shared';
import { CredentialsService } from './credentials.service';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('issue')
  issue(@Body() body: IssueCredentialRequest) {
    return this.credentialsService.issue(body);
  }

  @Post('verify')
  verify(@Body() body: VerifyCredentialRequest) {
    return this.credentialsService.verify(body);
  }

  @Post('revoke')
  revoke(@Body() body: RevokeCredentialRequest) {
    return this.credentialsService.revoke(body);
  }
}

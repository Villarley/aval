import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import type {
  CredentialClaims,
  VerifiableCredential,
  VerificationResult,
} from '@mi-billetera/shared';
import type { CredentialProvider } from '../credential-provider';
import { stellarPublicKeyToDidKey } from './did';
import {
  issueCredential,
  revokeCredential,
  verifyCredential,
} from './credentials';
import { fundAccount, generateKeypair } from './stellar';

@Injectable()
export class StellarSpikeProvider implements CredentialProvider, OnModuleInit {
  readonly name = 'stellar-spike';
  private readonly logger = new Logger(StellarSpikeProvider.name);
  private issuerSecret: string | null = null;

  async onModuleInit(): Promise<void> {
    const fromEnv = process.env.ISSUER_SECRET?.trim();
    if (fromEnv) {
      Keypair.fromSecret(fromEnv);
      this.issuerSecret = fromEnv;
      this.logger.log(`Issuer loaded from ISSUER_SECRET: ${this.issuerPublicKey()}`);
      return;
    }

    const kp = generateKeypair();
    this.issuerSecret = kp.secret();
    this.logger.log(`Generated demo issuer keypair: ${kp.publicKey()}`);
    this.logger.log('Funding issuer via Friendbot...');
    await fundAccount(kp.publicKey());
    this.logger.log('Issuer funded on testnet');
  }

  issuerDid(): string {
    return stellarPublicKeyToDidKey(this.issuerPublicKey());
  }

  issuerPublicKey(): string {
    return this.requireIssuer().publicKey();
  }

  issuerSecretKey(): string {
    return this.requireIssuer().secret();
  }

  async issue(input: {
    holderPublicKey: string;
    claims: CredentialClaims;
  }): Promise<{ credential: VerifiableCredential; anchorTxHash: string }> {
    const result = await issueCredential({
      issuerSecret: this.requireIssuer().secret(),
      holderPublicKey: input.holderPublicKey,
      claims: input.claims,
    });
    return {
      credential: result.credential,
      anchorTxHash: result.stellarTxHash,
    };
  }

  async verify(credential: VerifiableCredential): Promise<VerificationResult> {
    const result = await verifyCredential(credential);
    return {
      valid: result.valid,
      checks: {
        signature: result.checks.signatureValid,
        anchor: result.checks.anchorMatches,
        notRevoked: result.checks.notRevoked,
      },
      reason: result.reason,
    };
  }

  async revoke(credentialId: string): Promise<{ revocationTxHash: string }> {
    const result = await revokeCredential(
      this.requireIssuer().secret(),
      credentialId,
    );
    return { revocationTxHash: result.stellarTxHash };
  }

  private requireIssuer(): Keypair {
    if (!this.issuerSecret) {
      throw new Error('Issuer keypair not initialized');
    }
    return Keypair.fromSecret(this.issuerSecret);
  }
}

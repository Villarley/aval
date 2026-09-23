import { Keypair } from '@stellar/stellar-sdk';
import { v4 as uuidv4 } from 'uuid';
import type { VerifiableCredential, CredentialProof } from '@mi-billetera/shared';
import { didKeyToStellarPublicKey, stellarPublicKeyToDidKey } from './did';
import { hashCredential } from './hash';
import { getAccountData, setManageData } from './stellar';

export interface IssueInput {
  issuerSecret: string;
  holderPublicKey: string;
  claims: Record<string, unknown>;
}

export interface IssuedCredential {
  credential: VerifiableCredential;
  stellarTxHash: string;
  credentialHash: string;
}

export interface SpikeVerifyResult {
  valid: boolean;
  checks: {
    signatureValid: boolean;
    anchorMatches: boolean;
    notRevoked: boolean;
  };
  reason?: string;
}

/** Extract uuid from `urn:uuid:<uuid>` or `cred:<uuid>` / `revoked:<uuid>`. */
export function extractUuid(credentialId: string): string {
  if (credentialId.startsWith('urn:uuid:')) {
    return credentialId.slice('urn:uuid:'.length);
  }
  if (credentialId.startsWith('cred:')) {
    return credentialId.slice('cred:'.length);
  }
  if (credentialId.startsWith('revoked:')) {
    return credentialId.slice('revoked:'.length);
  }
  return credentialId;
}

export async function issueCredential(input: IssueInput): Promise<IssuedCredential> {
  const issuer = Keypair.fromSecret(input.issuerSecret);
  const issuerDid = stellarPublicKeyToDidKey(issuer.publicKey());
  const holderDid = stellarPublicKeyToDidKey(input.holderPublicKey);

  const uuid = uuidv4();
  const shortId = `cred:${uuid}`;

  const credentialWithoutProof: Omit<VerifiableCredential, 'proof'> = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://w3c-ccg.github.io/lds-ed25519-2018/contexts/Ed25519Signature2018.jsonld',
    ],
    id: `urn:uuid:${uuid}`,
    type: ['VerifiableCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: holderDid,
      ...input.claims,
    },
  };

  const { hex, bytes } = hashCredential(credentialWithoutProof);
  const signature = issuer.sign(bytes);

  const proof: CredentialProof = {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    verificationMethod: issuerDid,
    proofPurpose: 'assertionMethod',
    proofValue: Buffer.from(signature).toString('base64'),
    credentialId: shortId,
  };

  const credential: VerifiableCredential = {
    ...credentialWithoutProof,
    proof,
  };

  // Anchor hash on-chain via manageData (key = short id, value = SHA-256 bytes)
  const stellarTxHash = await setManageData(input.issuerSecret, shortId, bytes);

  return { credential, stellarTxHash, credentialHash: hex };
}

export async function verifyCredential(
  credential: VerifiableCredential,
): Promise<SpikeVerifyResult> {
  const checks = {
    signatureValid: false,
    anchorMatches: false,
    notRevoked: false,
  };

  if (!credential.proof) {
    return { valid: false, checks, reason: 'missing proof' };
  }

  const { proof, ...rest } = credential;
  const credentialWithoutProof = rest;

  let hashBytes: Buffer;
  try {
    hashBytes = hashCredential(credentialWithoutProof).bytes;
  } catch {
    return { valid: false, checks, reason: 'hash failed' };
  }

  // 1) Signature check
  try {
    const issuerPublicKey = didKeyToStellarPublicKey(
      proof.verificationMethod || credential.issuer,
    );
    const issuerKp = Keypair.fromPublicKey(issuerPublicKey);
    const sig = Buffer.from(proof.proofValue, 'base64');
    checks.signatureValid = issuerKp.verify(hashBytes, sig);
  } catch {
    checks.signatureValid = false;
  }

  if (!checks.signatureValid) {
    return { valid: false, checks, reason: 'invalid signature' };
  }

  // 2) On-chain anchor + 3) revocation
  const uuid = extractUuid(proof.credentialId || credential.id);
  const shortId = `cred:${uuid}`;
  const revokedKey = `revoked:${uuid}`;

  try {
    const issuerPublicKey = didKeyToStellarPublicKey(credential.issuer);
    const data = await getAccountData(issuerPublicKey);

    const anchored = data[shortId];
    checks.anchorMatches = !!anchored && anchored.equals(hashBytes);

    if (!checks.anchorMatches) {
      return {
        valid: false,
        checks: { ...checks, notRevoked: !data[revokedKey] },
        reason: 'anchor mismatch or missing',
      };
    }

    checks.notRevoked = !data[revokedKey];
    if (!checks.notRevoked) {
      return { valid: false, checks, reason: 'revoked' };
    }
  } catch (err) {
    return {
      valid: false,
      checks,
      reason: `stellar lookup failed: ${(err as Error).message}`,
    };
  }

  return { valid: true, checks };
}

export async function revokeCredential(
  issuerSecret: string,
  credentialId: string,
): Promise<{ stellarTxHash: string }> {
  const uuid = extractUuid(credentialId);
  const stellarTxHash = await setManageData(
    issuerSecret,
    `revoked:${uuid}`,
    Buffer.from('1', 'utf8'),
  );
  return { stellarTxHash };
}

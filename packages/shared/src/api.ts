import type {
  CredentialClaims,
  VerifiableCredential,
  VerificationResult,
} from './credential';

/**
 * A wallet holder identity (public fields only; secrets stay server-side in the demo).
 */
export interface Holder {
  id: string;
  displayName: string;
  publicKey: string;
  did: string;
}

/**
 * A credential as shown in the wallet UI, with computed status and anchor metadata.
 */
export interface WalletCredential {
  credential: VerifiableCredential;
  status: 'valid' | 'revoked' | 'unknown';
  anchorTxHash: string;
  explorerUrl: string;
  issuerName: string;
}

/** Request body for POST /credentials/issue. */
export interface IssueCredentialRequest {
  holderId: string;
  claims: CredentialClaims;
}

/** Response body for POST /credentials/issue. */
export interface IssueCredentialResponse {
  credential: VerifiableCredential;
  anchorTxHash: string;
  explorerUrl: string;
}

/** Request body for POST /credentials/verify. */
export interface VerifyCredentialRequest {
  credential: VerifiableCredential;
}

/** Response body for POST /credentials/verify. */
export type VerifyCredentialResponse = VerificationResult;

/** Request body for POST /credentials/revoke. */
export interface RevokeCredentialRequest {
  credentialId: string;
}

/** Response body for POST /credentials/revoke. */
export interface RevokeCredentialResponse {
  revocationTxHash: string;
  explorerUrl: string;
}

/** Request body for POST /holders. */
export interface CreateHolderRequest {
  displayName: string;
}

/** Response body for POST /holders. */
export type CreateHolderResponse = Holder;

/** Response body for GET /holders/:id/credentials. */
export interface ListHolderCredentialsResponse {
  holder: Holder;
  credentials: WalletCredential[];
}

/** Request body for POST /shares. */
export interface CreateShareRequest {
  credentialId: string;
}

/** Response body for POST /shares. */
export interface CreateShareResponse {
  token: string;
  verifyUrl: string;
  expiresAt: string;
}

/** Response body for GET /shares/:token. */
export interface GetShareResponse {
  credential: VerifiableCredential;
  verification: VerificationResult;
  issuerName: string;
}

/** Canonical path strings for the HTTP API contract. */
export const API_ROUTES = {
  health: '/health',
  holders: '/holders',
  holderCredentials: '/holders/:id/credentials',
  issueCredential: '/credentials/issue',
  verifyCredential: '/credentials/verify',
  revokeCredential: '/credentials/revoke',
  shares: '/shares',
  getShare: '/shares/:token',
} as const;

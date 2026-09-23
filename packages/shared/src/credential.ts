/**
 * W3C Verifiable Credential document (simplified for this prototype).
 */
export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    [key: string]: unknown;
  };
  proof?: CredentialProof;
}

/**
 * Simplified Ed25519Signature2020-shaped proof (SHA-256 of canonical JSON, not URDNA2015).
 */
export interface CredentialProof {
  type: 'Ed25519Signature2020';
  created: string;
  verificationMethod: string;
  proofPurpose: 'assertionMethod';
  /** Base64-encoded Ed25519 signature over the credential hash. */
  proofValue: string;
  /** Short id used as Stellar manageData key (cred:<uuid>). */
  credentialId: string;
}

/**
 * Outcome of verifying a credential (signature, on-chain anchor, revocation).
 */
export interface VerificationResult {
  valid: boolean;
  checks: {
    signature: boolean;
    anchor: boolean;
    notRevoked: boolean;
  };
  reason?: string;
}

/**
 * Claims embedded in a credential subject for this demo issuer.
 */
export interface CredentialClaims {
  achievement: string;
  institution: string;
  issuedToName: string;
  description?: string;
  [k: string]: unknown;
}

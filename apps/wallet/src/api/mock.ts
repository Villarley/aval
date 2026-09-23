import type {
  CreateHolderRequest,
  CreateHolderResponse,
  CreateShareRequest,
  CreateShareResponse,
  GetShareResponse,
  IssueCredentialRequest,
  IssueCredentialResponse,
  ListHolderCredentialsResponse,
  RevokeCredentialRequest,
  RevokeCredentialResponse,
  VerifiableCredential,
  VerifyCredentialRequest,
  VerifyCredentialResponse,
  WalletCredential,
} from '@mi-billetera/shared';

const MOCK_DELAY_MS = 300;

const HOLDER_ID = 'holder-santiago-villarreal';
const HOLDER_DID = 'did:key:z6MkholderSantiagoVillarrealDemoKey123456789';
const ISSUER_DID = 'did:key:z6MkissuerTecDemoKey123456789012345678901';

const EXPLORER_BASE =
  'https://stellar.expert/explorer/testnet/tx';

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

function makeCredential(
  id: string,
  achievement: string,
  description: string,
): VerifiableCredential {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://purl.org/tec/credentials/v1',
    ],
    id: `urn:uuid:${id}`,
    type: ['VerifiableCredential', 'AchievementCredential'],
    issuer: ISSUER_DID,
    issuanceDate: '2025-05-15T10:00:00.000Z',
    credentialSubject: {
      id: HOLDER_DID,
      achievement,
      institution: 'TEC',
      issuedToName: 'Santiago Villarreal',
      description,
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2025-05-15T10:00:00.000Z',
      verificationMethod: `${ISSUER_DID}#key-1`,
      proofPurpose: 'assertionMethod',
      proofValue: 'mockBase64SignatureValue==',
      credentialId: id,
    },
  };
}

const mockCredentials: WalletCredential[] = [
  {
    credential: makeCredential(
      'cred-admin-proyectos',
      'Administracion de Proyectos',
      'Aprobado con calificacion 92.',
    ),
    status: 'valid',
    anchorTxHash: 'a1b2c3d4e5f6mocktxhash0000000000000000000000000000000001',
    explorerUrl: `${EXPLORER_BASE}/a1b2c3d4e5f6mocktxhash0000000000000000000000000000000001`,
    issuerName: 'TEC',
  },
  {
    credential: makeCredential(
      'cred-bases-datos-ii',
      'Bases de Datos II',
      'Aprobado con calificacion 88.',
    ),
    status: 'valid',
    anchorTxHash: 'a1b2c3d4e5f6mocktxhash0000000000000000000000000000000002',
    explorerUrl: `${EXPLORER_BASE}/a1b2c3d4e5f6mocktxhash0000000000000000000000000000000002`,
    issuerName: 'TEC',
  },
  {
    credential: makeCredential(
      'cred-taller-programacion',
      'Taller de Programacion',
      'Curso reprobado; credencial revocada por error de registro.',
    ),
    status: 'revoked',
    anchorTxHash: 'a1b2c3d4e5f6mocktxhash0000000000000000000000000000000003',
    explorerUrl: `${EXPLORER_BASE}/a1b2c3d4e5f6mocktxhash0000000000000000000000000000000003`,
    issuerName: 'TEC',
  },
];

const mockHolder: CreateHolderResponse = {
  id: HOLDER_ID,
  displayName: 'Santiago Villarreal',
  publicKey: 'GCKMockPublicKeyForSantiagoVillarrealDemo1234567890',
  did: HOLDER_DID,
};

const shares = new Map<string, { credentialId: string; expiresAt: string }>();

function findWalletCredential(credentialId: string): WalletCredential | undefined {
  return mockCredentials.find(
    (item) => item.credential.proof?.credentialId === credentialId,
  );
}

export async function createHolder(
  body: CreateHolderRequest,
): Promise<CreateHolderResponse> {
  return delay({
    ...mockHolder,
    displayName: body.displayName,
  });
}

export async function listHolderCredentials(
  _holderId: string,
): Promise<ListHolderCredentialsResponse> {
  return delay({
    holder: mockHolder,
    credentials: mockCredentials,
  });
}

export async function issueCredential(
  body: IssueCredentialRequest,
): Promise<IssueCredentialResponse> {
  const credentialId = `cred-${crypto.randomUUID().slice(0, 8)}`;
  const credential = makeCredential(
    credentialId,
    body.claims.achievement,
    body.claims.description ?? '',
  );
  credential.credentialSubject.issuedToName = body.claims.issuedToName;

  const anchorTxHash =
    'a1b2c3d4e5f6mocktxhash0000000000000000000000000000000099';

  return delay({
    credential,
    anchorTxHash,
    explorerUrl: `${EXPLORER_BASE}/${anchorTxHash}`,
  });
}

export async function verifyCredential(
  body: VerifyCredentialRequest,
): Promise<VerifyCredentialResponse> {
  const credentialId = body.credential.proof?.credentialId;
  const walletItem = credentialId
    ? findWalletCredential(credentialId)
    : undefined;
  const revoked = walletItem?.status === 'revoked';

  return delay({
    valid: !revoked,
    checks: {
      signature: true,
      anchor: true,
      notRevoked: !revoked,
    },
    reason: revoked ? 'La credencial fue revocada por el emisor.' : undefined,
  });
}

export async function revokeCredential(
  body: RevokeCredentialRequest,
): Promise<RevokeCredentialResponse> {
  const item = findWalletCredential(body.credentialId);
  if (item) {
    item.status = 'revoked';
  }

  const revocationTxHash =
    'a1b2c3d4e5f6mocktxhash00000000000000000000000000000000rev';

  return delay({
    revocationTxHash,
    explorerUrl: `${EXPLORER_BASE}/${revocationTxHash}`,
  });
}

export async function createShare(
  body: CreateShareRequest,
): Promise<CreateShareResponse> {
  const token = `share-${crypto.randomUUID().slice(0, 12)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  shares.set(token, { credentialId: body.credentialId, expiresAt });

  const verifyUrl = `${window.location.origin}/verificar/${token}`;

  return delay({
    token,
    verifyUrl,
    expiresAt,
  });
}

export async function getShare(token: string): Promise<GetShareResponse> {
  const share = shares.get(token);
  const walletItem = share
    ? findWalletCredential(share.credentialId)
    : mockCredentials[0];

  if (!walletItem) {
    throw new Error('Enlace de verificacion no valido o expirado.');
  }

  const verification = await verifyCredential({
    credential: walletItem.credential,
  });

  return delay({
    credential: walletItem.credential,
    verification,
    issuerName: walletItem.issuerName,
  });
}

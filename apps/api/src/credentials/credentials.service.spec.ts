import type { VerifiableCredential } from '@mi-billetera/shared';
import { CredentialsService } from './credentials.service';
import type { CredentialProvider } from '../providers/credential-provider';
import { InMemoryStore } from '../store/in-memory.store';

describe('CredentialsService', () => {
  const holderId = 'holder-1';
  const urnId = 'urn:uuid:11111111-1111-4111-8111-111111111111';
  const credId = 'cred:11111111-1111-4111-8111-111111111111';

  const credential: VerifiableCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: urnId,
    type: ['VerifiableCredential'],
    issuer: 'did:key:issuer',
    issuanceDate: '2026-01-01T00:00:00.000Z',
    credentialSubject: {
      id: 'did:key:holder',
      achievement: 'AP - Aprobado',
      institution: 'TEC',
      issuedToName: 'Test Student',
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2026-01-01T00:00:00.000Z',
      verificationMethod: 'did:key:issuer#key-1',
      proofPurpose: 'assertionMethod',
      proofValue: 'mock-signature',
      credentialId: credId,
    },
  };

  let store: InMemoryStore;
  let provider: jest.Mocked<CredentialProvider>;
  let service: CredentialsService;

  beforeEach(() => {
    store = new InMemoryStore();
    store.holders.set(holderId, {
      id: holderId,
      displayName: 'Test Holder',
      publicKey: 'GTESTPUBLICKEY',
      did: 'did:key:holder',
      secret: 'STESTSECRET',
    });

    provider = {
      name: 'mock',
      issue: jest.fn().mockResolvedValue({
        credential,
        anchorTxHash: 'anchor-tx-hash',
      }),
      verify: jest.fn(),
      revoke: jest.fn(),
      issuerDid: jest.fn().mockReturnValue('did:key:issuer'),
    };

    service = new CredentialsService(store, provider);
  });

  it('stores one credential per issue and resolves by urn or cred id', async () => {
    await service.issue({
      holderId,
      claims: {
        achievement: 'AP - Aprobado',
        institution: 'TEC',
        issuedToName: 'Test Student',
      },
    });

    expect(store.credentialsForHolder(holderId)).toHaveLength(1);
    expect(store.findCredentialById(urnId)?.credential).toBe(credential);
    expect(store.findCredentialById(credId)?.credential).toBe(credential);
  });
});

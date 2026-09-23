import { Keypair } from '@stellar/stellar-sdk';
import { StellarSpikeProvider } from './stellar-spike.provider';
import { hashCredential } from './hash';
import { extractUuid } from './credentials';
import type { VerifiableCredential } from '@mi-billetera/shared';

jest.mock('./stellar', () => ({
  generateKeypair: jest.fn(),
  fundAccount: jest.fn().mockResolvedValue(undefined),
  setManageData: jest.fn(),
  getAccountData: jest.fn(),
}));

import { getAccountData, setManageData } from './stellar';

const mockedSetManageData = setManageData as jest.MockedFunction<typeof setManageData>;
const mockedGetAccountData = getAccountData as jest.MockedFunction<typeof getAccountData>;

describe('StellarSpikeProvider (mocked stellar)', () => {
  const issuer = Keypair.random();
  const holder = Keypair.random();
  let provider: StellarSpikeProvider;
  let accountData: Record<string, Buffer>;

  beforeEach(async () => {
    jest.clearAllMocks();
    accountData = {};

    mockedSetManageData.mockImplementation(async (_secret, name, value) => {
      const bytes = typeof value === 'string' ? Buffer.from(value, 'utf8') : value;
      accountData[name] = Buffer.from(bytes);
      return `tx-hash-${name}`;
    });

    mockedGetAccountData.mockImplementation(async () => ({ ...accountData }));

    process.env.ISSUER_SECRET = issuer.secret();
    provider = new StellarSpikeProvider();
    await provider.onModuleInit();
  });

  it('issue then verify returns valid', async () => {
    const { credential, anchorTxHash } = await provider.issue({
      holderPublicKey: holder.publicKey(),
      claims: {
        achievement: 'AP - Aprobado',
        institution: 'TEC',
        issuedToName: 'Test Student',
      },
    });

    expect(anchorTxHash).toMatch(/^tx-hash-cred:/);
    expect(credential.proof).toBeDefined();

    const result = await provider.verify(credential);
    expect(result.valid).toBe(true);
    expect(result.checks).toEqual({
      signature: true,
      anchor: true,
      notRevoked: true,
    });
  });

  it('tampered claims fail signature check', async () => {
    const { credential } = await provider.issue({
      holderPublicKey: holder.publicKey(),
      claims: {
        achievement: 'AP - Aprobado',
        institution: 'TEC',
        issuedToName: 'Test Student',
      },
    });

    const tampered: VerifiableCredential = {
      ...credential,
      credentialSubject: {
        ...credential.credentialSubject,
        achievement: 'TAMPERED',
      },
    };

    const result = await provider.verify(tampered);
    expect(result.valid).toBe(false);
    expect(result.checks.signature).toBe(false);
    expect(result.reason).toBe('invalid signature');
  });

  it('revoked credential reports notRevoked false', async () => {
    const { credential } = await provider.issue({
      holderPublicKey: holder.publicKey(),
      claims: {
        achievement: 'AP - Aprobado',
        institution: 'TEC',
        issuedToName: 'Test Student',
      },
    });

    const credentialId = credential.proof!.credentialId;
    await provider.revoke(credentialId);

    const uuid = extractUuid(credentialId);
    expect(accountData[`revoked:${uuid}`]).toBeDefined();

    // Ensure anchor still present so revoke path is reached
    const { proof, ...withoutProof } = credential;
    const hashBytes = hashCredential(withoutProof).bytes;
    expect(accountData[credentialId].equals(hashBytes)).toBe(true);

    const result = await provider.verify(credential);
    expect(result.valid).toBe(false);
    expect(result.checks.signature).toBe(true);
    expect(result.checks.anchor).toBe(true);
    expect(result.checks.notRevoked).toBe(false);
    expect(result.reason).toBe('revoked');
  });
});

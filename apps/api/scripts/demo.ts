/**
 * Stellar-spike end-to-end demo (Stellar Testnet) via StellarSpikeProvider.
 *
 * Steps:
 *  1. Generate issuer + holder keypairs
 *  2. Fund both via Friendbot
 *  3. Issue a sample Verifiable Credential + anchor hash on-chain
 *  4. Verify (expect valid)
 *  5. Revoke on-chain
 *  6. Verify again (expect invalid / revoked)
 */
import { generateKeypair, fundAccount } from '../src/providers/stellar-spike/stellar';
import { stellarPublicKeyToDidKey } from '../src/providers/stellar-spike/did';
import { StellarSpikeProvider } from '../src/providers/stellar-spike/stellar-spike.provider';
import { explorerUrl } from '../src/common/explorer';

function banner(title: string) {
  console.log('\n' + '='.repeat(72));
  console.log(`  ${title}`);
  console.log('='.repeat(72));
}

async function main() {
  banner('stellar-spike PoC: W3C VC + Stellar Testnet demo');

  // --- 1. Identities ---
  banner('STEP 1: Generate issuer & holder keypairs');
  const issuer = generateKeypair();
  const holder = generateKeypair();
  console.log('Issuer public key :', issuer.publicKey());
  console.log('Issuer did:key    :', stellarPublicKeyToDidKey(issuer.publicKey()));
  console.log('Holder public key :', holder.publicKey());
  console.log('Holder did:key    :', stellarPublicKeyToDidKey(holder.publicKey()));

  // --- 2. Fund ---
  banner('STEP 2: Fund accounts via Friendbot (testnet)');
  console.log('Funding issuer...');
  await fundAccount(issuer.publicKey());
  console.log('Issuer funded.');
  console.log('Funding holder...');
  await fundAccount(holder.publicKey());
  console.log('Holder funded.');

  process.env.ISSUER_SECRET = issuer.secret();
  const provider = new StellarSpikeProvider();
  await provider.onModuleInit();

  // --- 3. Issue ---
  banner('STEP 3: Issue Verifiable Credential + anchor on Stellar');
  const claims = {
    achievement: 'Administracion de Proyectos - Aprobado',
    institution: 'TEC',
    issuedToName: 'Demo Student',
  };
  console.log('Claims:', JSON.stringify(claims, null, 2));

  const issued = await provider.issue({
    holderPublicKey: holder.publicKey(),
    claims,
  });

  console.log('Stellar anchor tx hash:', issued.anchorTxHash);
  console.log('Explorer:', explorerUrl(issued.anchorTxHash));
  console.log('\nIssued VC JSON:');
  console.log(JSON.stringify(issued.credential, null, 2));

  // --- 4. Verify (should be valid) ---
  banner('STEP 4: Verify credential (expect VALID)');
  const before = await provider.verify(issued.credential);
  console.log(JSON.stringify(before, null, 2));
  if (!before.valid) {
    throw new Error('Expected credential to be valid before revocation');
  }
  console.log('OK: Credential is valid (signature + on-chain anchor + not revoked)');

  // --- 5. Revoke ---
  banner('STEP 5: Revoke credential on Stellar (manageData revoked:<uuid>)');
  const credentialId = issued.credential.proof!.credentialId;
  const revoked = await provider.revoke(credentialId);
  console.log('Revocation tx hash:', revoked.revocationTxHash);
  console.log('Explorer:', explorerUrl(revoked.revocationTxHash));

  // --- 6. Verify again (should be revoked) ---
  banner('STEP 6: Verify credential again (expect INVALID / revoked)');
  const after = await provider.verify(issued.credential);
  console.log(JSON.stringify(after, null, 2));
  if (after.valid || after.reason !== 'revoked') {
    throw new Error(
      `Expected reason "revoked", got valid=${after.valid} reason=${after.reason}`,
    );
  }
  console.log('OK: Credential correctly reported as revoked');

  banner('DEMO COMPLETE: all steps succeeded');
  console.log('Summary:');
  console.log('  - Issued VC for holder with TEC achievement claim');
  console.log('  - Anchored SHA-256 hash via Stellar manageData');
  console.log('  - Verified signature + on-chain anchor');
  console.log('  - Revoked via manageData and re-verified as invalid');
}

main().catch((err) => {
  console.error('\nDEMO FAILED:', err);
  process.exit(1);
});

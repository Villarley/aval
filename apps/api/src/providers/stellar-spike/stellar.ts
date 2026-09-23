import {
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  BASE_FEE,
} from '@stellar/stellar-sdk';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export const server = new Horizon.Server(HORIZON_URL);

/** Generate a fresh Stellar Ed25519 keypair. */
export function generateKeypair(): Keypair {
  return Keypair.random();
}

/** Fund a testnet account via Friendbot (~10,000 XLM). */
export async function fundAccount(publicKey: string): Promise<void> {
  const res = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`,
  );
  if (!res.ok) {
    const body = await res.text();
    // Already funded / create race: treat as success if account is loadable next
    if (res.status !== 400) {
      throw new Error(`Friendbot failed (${res.status}): ${body}`);
    }
  }
  // Wait until Horizon can load the account
  for (let i = 0; i < 10; i++) {
    try {
      await server.loadAccount(publicKey);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`Account ${publicKey} not visible on Horizon after Friendbot`);
}

/**
 * Anchor (or update) a manageData entry on the issuer account.
 * name <= 64 bytes, value <= 64 bytes (Stellar protocol limits).
 */
export async function setManageData(
  issuerSecret: string,
  name: string,
  value: Buffer | string,
): Promise<string> {
  const issuer = Keypair.fromSecret(issuerSecret);
  const account = await server.loadAccount(issuer.publicKey());

  const valueBytes =
    typeof value === 'string' ? Buffer.from(value, 'utf8') : value;

  if (Buffer.byteLength(name, 'utf8') > 64) {
    throw new Error(`manageData name too long (>64): ${name}`);
  }
  if (valueBytes.length > 64) {
    throw new Error(`manageData value too long (>64 bytes)`);
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name,
        value: valueBytes,
      }),
    )
    .setTimeout(180)
    .build();

  tx.sign(issuer);
  const result = await server.submitTransaction(tx);
  return result.hash as string;
}

/** Read manageData entries from a Stellar account (values as Buffers). */
export async function getAccountData(
  publicKey: string,
): Promise<Record<string, Buffer>> {
  const account = await server.loadAccount(publicKey);
  // Horizon stores manageData values as base64 in data_attr
  const raw = (account as { data_attr?: Record<string, string> }).data_attr ?? {};
  const out: Record<string, Buffer> = {};
  for (const [key, base64Value] of Object.entries(raw)) {
    out[key] = Buffer.from(base64Value, 'base64');
  }
  return out;
}

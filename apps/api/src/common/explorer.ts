/** Stellar Expert explorer URL for a testnet transaction hash. */
export function explorerUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

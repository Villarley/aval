import { Module } from '@nestjs/common';
import { CREDENTIAL_PROVIDER } from './credential-provider';
import { ActaProvider } from './acta/acta.provider';
import { StellarSpikeProvider } from './stellar-spike/stellar-spike.provider';

function selectProvider(): typeof StellarSpikeProvider | typeof ActaProvider {
  const choice = (process.env.CREDENTIAL_PROVIDER ?? 'stellar-spike').trim();
  if (choice === 'acta') {
    return ActaProvider;
  }
  return StellarSpikeProvider;
}

@Module({
  providers: [
    {
      provide: CREDENTIAL_PROVIDER,
      useClass: selectProvider(),
    },
  ],
  exports: [CREDENTIAL_PROVIDER],
})
export class ProvidersModule {}

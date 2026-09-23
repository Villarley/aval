import { Module } from '@nestjs/common';
import { CredentialsModule } from './credentials/credentials.module';
import { HealthModule } from './health/health.module';
import { HoldersModule } from './holders/holders.module';
import { ProvidersModule } from './providers/providers.module';
import { SharesModule } from './shares/shares.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    StoreModule,
    ProvidersModule,
    HealthModule,
    HoldersModule,
    CredentialsModule,
    SharesModule,
  ],
})
export class AppModule {}

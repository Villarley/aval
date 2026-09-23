import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';

@Module({
  imports: [ProvidersModule],
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}

import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { HoldersController } from './holders.controller';
import { HoldersService } from './holders.service';

@Module({
  imports: [ProvidersModule],
  controllers: [HoldersController],
  providers: [HoldersService],
  exports: [HoldersService],
})
export class HoldersModule {}

import { Global, Module } from '@nestjs/common';
import { InMemoryStore } from './in-memory.store';

/** Demo-only global in-memory store (lost on restart). */
@Global()
@Module({
  providers: [InMemoryStore],
  exports: [InMemoryStore],
})
export class StoreModule {}

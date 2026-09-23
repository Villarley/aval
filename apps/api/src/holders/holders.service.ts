import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { CreateHolderRequest, Holder } from '@mi-billetera/shared';
import { fundAccount, generateKeypair } from '../providers/stellar-spike/stellar';
import { stellarPublicKeyToDidKey } from '../providers/stellar-spike/did';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class HoldersService {
  constructor(private readonly store: InMemoryStore) {}

  async create(body: CreateHolderRequest): Promise<Holder> {
    if (!body?.displayName || typeof body.displayName !== 'string') {
      throw new BadRequestException('displayName is required');
    }

    const kp = generateKeypair();
    await fundAccount(kp.publicKey());

    const holder: Holder = {
      id: uuidv4(),
      displayName: body.displayName.trim(),
      publicKey: kp.publicKey(),
      did: stellarPublicKeyToDidKey(kp.publicKey()),
    };

    // TODO: real wallet layer (Cavos) will own keys; secrets stay server-side for this demo only.
    this.store.holders.set(holder.id, { ...holder, secret: kp.secret() });
    return holder;
  }

  get(id: string): Holder {
    const stored = this.store.holders.get(id);
    if (!stored) {
      throw new NotFoundException(`Holder not found: ${id}`);
    }
    const { secret: _secret, ...holder } = stored;
    return holder;
  }
}

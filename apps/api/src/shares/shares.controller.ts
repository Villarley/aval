import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { CreateShareRequest } from '@mi-billetera/shared';
import { SharesService } from './shares.service';

@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(@Body() body: CreateShareRequest) {
    return this.sharesService.create(body);
  }

  @Get(':token')
  get(@Param('token') token: string) {
    return this.sharesService.get(token);
  }
}

import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CallbackHeaders, DepositConfirmedCallbackBody } from '../callback/callback.types';
import { CallbackTestService } from './callback-test.service';
import { GetCallbackTestQueryDto } from './dto/get-callback-test.query.dto';

@ApiTags('Callbacks-Test')
@Controller('portal/callbacks-test')
export class CallbackTestController {
  constructor(private readonly service: CallbackTestService) {}

  @Post()
  async receive(@Body() body: DepositConfirmedCallbackBody, @Headers() headers: CallbackHeaders) {
    await this.service.save(body, headers);

    return { ok: true };
  }

  @Get()
  findAll(@Query() query: GetCallbackTestQueryDto) {
    return this.service.findAll(query);
  }
}

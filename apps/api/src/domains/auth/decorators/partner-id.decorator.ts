// domains/auth/decorators/partner-id.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithPartner } from '../guards/api-key.guard';

export const PartnerId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<IRequestWithPartner>();

  if (!request.partnerId) {
    throw new Error('PartnerId not found in request');
  }

  return request.partnerId;
});

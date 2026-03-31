/**
 * admin/partner/dto/admin-partner-create-apikey.dto.ts
 */

import { ApiProperty } from '@nestjs/swagger';

export class AdminPartnerCreateApiKeyResponseDto {
  @ApiProperty({
    description: '발급된 API Key (1회만 확인 가능)',
  })
  apiKey!: string;
}

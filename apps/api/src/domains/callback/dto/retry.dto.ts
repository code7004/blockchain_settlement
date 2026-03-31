import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RetryFailedAllBodyDto extends ApiPartnerIdDto {}
export class RetryFailedIdsBodyDto extends ApiPartnerIdDto {
  @ApiProperty({ description: 'callback ids 최대 1000개' })
  @IsOptional()
  ids?: string[];
}

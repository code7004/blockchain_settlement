import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCallbackDto {
  @ApiPropertyOptional({
    example: 'https://new-callback.com',
    description: '콜백 URL 수정',
  })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

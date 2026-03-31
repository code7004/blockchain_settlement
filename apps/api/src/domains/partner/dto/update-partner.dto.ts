import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePartnerDto {
  @ApiPropertyOptional({
    example: 'partner-new-name',
    description: '파트너 이름 변경',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'https://new-callback.com',
    description: '콜백 URL 수정',
  })
  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @ApiPropertyOptional({
    example: 'newsecret123',
    description: '콜백 시크릿 변경',
  })
  @IsOptional()
  @IsString()
  callbackSecret?: string;

  @ApiPropertyOptional({
    example: false,
    description: '파트너 활성 여부',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

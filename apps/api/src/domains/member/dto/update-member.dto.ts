import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({
    example: false,
    description: '파트너 활성 여부',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

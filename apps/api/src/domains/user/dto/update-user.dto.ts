import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: false,
    description: '유저 활성 여부',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

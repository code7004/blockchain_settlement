import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateReclaimJobsDto {
  @ApiProperty({
    description: '파트너 id',
  })
  @IsUUID()
  partnerId!: string;

  @ApiProperty({
    description: 'wallet ids',
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  ids?: string[];

  @ApiPropertyOptional({
    description: 'wallet status',
    enum: WalletStatus,
  })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;
}

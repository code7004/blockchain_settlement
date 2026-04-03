import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WithdrawalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetWithdrawalsQueryDto extends GetTableQueryDto {
  @ApiPropertyOptional({
    description: '파트너 ID 필터',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Withdrawal 상태',
    enum: WithdrawalStatus,
  })
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;
}

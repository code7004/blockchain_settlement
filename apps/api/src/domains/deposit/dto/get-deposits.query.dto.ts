// get-deposits.query.dto.ts
import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

class FilterQueryDto {
  @ApiPropertyOptional({ description: 'txHash' })
  @IsOptional()
  txHash?: string;
}

export class ApiGetDepositQueryDto extends IntersectionType(FilterQueryDto, GetTableQueryDto) {}
export class GetDepositsQueryDto extends IntersectionType(ApiPartnerIdDto, FilterQueryDto, GetTableQueryDto) {}

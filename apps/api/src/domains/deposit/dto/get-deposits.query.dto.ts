import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { PaginationQueryDto } from '@/core/dto/pagination.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

class FilterQueryDto {
  @ApiPropertyOptional({ description: 'txHash' })
  @IsOptional()
  txHash?: string;
}

export class ApiGetDepositQueryDto extends IntersectionType(FilterQueryDto, PaginationQueryDto) {}
export class GetDepositsQueryDto extends IntersectionType(ApiPartnerIdDto, FilterQueryDto, PaginationQueryDto) {}

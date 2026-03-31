import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { PaginationQueryDto } from '@/core/dto/pagination.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

class FilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'address' })
  @IsOptional()
  keyword?: string;
}

export class ApiGetWalletsQueryDto extends IntersectionType(FilterQueryDto, PaginationQueryDto) {}
export class GetWalletsQueryDto extends IntersectionType(ApiPartnerIdDto, ApiGetWalletsQueryDto) {}

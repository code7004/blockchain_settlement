import { PaginationQueryDto } from '@/core/dto/pagination.query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { IntersectionType } from '@nestjs/swagger';

class FilterQueryDto {
  @ApiPropertyOptional({
    description: 'username fitler',
  })
  @IsOptional()
  externalUserId?: string;

  @ApiPropertyOptional({
    description: 'id or extureUserId',
  })
  @IsOptional()
  keyword?: string;
}

export class ApiGetUsersQueryDto extends IntersectionType(FilterQueryDto, PaginationQueryDto) {}
export class AdminGetUsersQueryDto extends IntersectionType(ApiPartnerIdDto, ApiGetUsersQueryDto) {}

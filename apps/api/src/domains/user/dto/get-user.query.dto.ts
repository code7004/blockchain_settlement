import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

  @ApiPropertyOptional({
    description: '유저 활성 여부',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class ApiGetUsersQueryDto extends IntersectionType(FilterQueryDto, GetTableQueryDto) {}
export class AdminGetUsersQueryDto extends IntersectionType(ApiPartnerIdDto, FilterQueryDto, GetTableQueryDto) {}

import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { WalletStatus } from '@prisma/client';
import { IsOptional } from 'class-validator';

class FilterQueryDto extends GetTableQueryDto {
  @ApiPropertyOptional({ description: 'address' })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: 'status', enum: WalletStatus })
  @IsOptional()
  status?: WalletStatus;
}

export class ApiGetWalletsQueryDto extends IntersectionType(FilterQueryDto, GetTableQueryDto) {}
export class GetWalletsQueryDto extends IntersectionType(ApiPartnerIdDto, ApiGetWalletsQueryDto) {}

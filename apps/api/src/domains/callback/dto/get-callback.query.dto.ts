// callback/dto/get-callback.query.dto.ts
import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { PaginationQueryDto } from '@/core/dto/pagination.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { CallbackStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

class FilterQueryDto {
  @ApiPropertyOptional({ description: 'depositId' })
  @IsOptional()
  depositId?: string;

  @ApiPropertyOptional({
    description: 'status',
    enum: CallbackStatus,
  })
  @IsOptional()
  @IsEnum(CallbackStatus)
  status?: CallbackStatus;
}

export class GetCallbackQueryDto extends IntersectionType(ApiPartnerIdDto, FilterQueryDto, PaginationQueryDto) {}

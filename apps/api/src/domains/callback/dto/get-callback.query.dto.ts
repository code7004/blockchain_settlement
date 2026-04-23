// callback/dto/get-callback.query.dto.ts
import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { CallbackStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

class FilterQueryDto {
  @ApiPropertyOptional({ description: 'id' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({
    description: 'status',
    enum: CallbackStatus,
  })
  @IsOptional()
  @IsEnum(CallbackStatus)
  status?: CallbackStatus;
}

export class GetCallbackQueryDto extends IntersectionType(ApiPartnerIdDto, FilterQueryDto, GetTableQueryDto) {}

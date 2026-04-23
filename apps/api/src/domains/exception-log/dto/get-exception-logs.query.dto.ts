import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExceptionLogStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetExceptionLogsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: PAGINATION_DEFAULT_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit?: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ example: 'Cannot read properties' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: '/portal/sweeps' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'GET' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ enum: ExceptionLogStatus, example: ExceptionLogStatus.OPEN })
  @IsOptional()
  @IsEnum(ExceptionLogStatus)
  status?: ExceptionLogStatus;
}

import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT, PAGINATION_MAX_OFFSET } from '@/core/constants';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: PAGINATION_DEFAULT_LIMIT,
    description: `조회 개수 (기본 ${PAGINATION_DEFAULT_LIMIT}, 최대 ${PAGINATION_MAX_LIMIT})`,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit?: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({
    example: 0,
    description: '조회 시작 offset',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(PAGINATION_MAX_OFFSET)
  offset?: number = 0;
}

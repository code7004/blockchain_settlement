import { PaginationQueryDto } from '@/core/dto/pagination.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'member id filter',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;
}

export class GetPartnersQueryDto extends IntersectionType(FilterDto, PaginationQueryDto) {}

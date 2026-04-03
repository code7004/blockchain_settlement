import { GetTableQueryDto } from '@/core/dto/get-table.query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

class FilterDto extends GetTableQueryDto {
  @ApiPropertyOptional({
    description: 'member id filter',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;
}

export class GetPartnersQueryDto extends IntersectionType(FilterDto, GetTableQueryDto) {}

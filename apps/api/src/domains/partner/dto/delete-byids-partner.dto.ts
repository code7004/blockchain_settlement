import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteByIdsPartnersDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: '삭제할 partner id 배열',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}

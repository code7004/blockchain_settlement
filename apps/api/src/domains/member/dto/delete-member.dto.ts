import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteMembersDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: '삭제할 user id 배열',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}

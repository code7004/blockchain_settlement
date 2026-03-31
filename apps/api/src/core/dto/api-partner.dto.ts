import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ApiPartnerIdDto {
  @ApiProperty({
    description: '소속 파트너 ID (UUID)',
  })
  @IsString()
  @IsUUID()
  partnerId!: string;
}

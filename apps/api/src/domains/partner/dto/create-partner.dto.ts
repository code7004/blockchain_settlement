import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({
    description: '관리자 ID (UUID)',
  })
  @IsUUID()
  memberId!: string;

  @ApiProperty({
    example: 'partner-a',
    description: '파트너 고유 이름 (UNIQUE)',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'https://partner-a.com/callback',
    description: '입금 확정 시 호출될 콜백 URL',
  })
  @IsString()
  callbackUrl!: string;

  @ApiProperty({
    example: 'supersecret123',
    description: 'HMAC 서명용 시크릿 키',
  })
  @IsString()
  @MinLength(10)
  callbackSecret!: string;
}

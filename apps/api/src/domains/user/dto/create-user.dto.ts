import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CretaUserDto {
  @ApiProperty({
    example: 'user001',
    description: '파트너 내부 유저 식별자 (파트너 단위 UNIQUE)',
  })
  @IsString()
  @MinLength(1)
  externalUserId!: string;
}

export class CreateUserDto extends IntersectionType(ApiPartnerIdDto, CretaUserDto) {}

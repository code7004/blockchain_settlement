import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ description: '관리자 ID (영문+숫자, 8~30자)' })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'username은 영문과 숫자만 사용 가능합니다.',
  })
  username!: string;

  @ApiProperty({ description: '관리자 암호 (대소문자/숫자/특수문자 포함 10~64자)' })
  @IsString()
  @MinLength(10)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]+$/, {
    message: 'password는 대문자, 소문자, 숫자, 특수문자를 포함해야 하며 공백을 사용할 수 없습니다.',
  })
  password!: string;

  @ApiProperty({ enum: MemberRole, example: MemberRole.DEVELOPER })
  @IsEnum(MemberRole)
  role!: MemberRole;
}

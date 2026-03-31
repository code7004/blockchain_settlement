import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class VerifyPwdMemberDto {
  @ApiProperty({ description: '멤버 ID' })
  @IsString()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: '멤버 암호 (대소문자/숫자/특수문자 포함 10~64자)' })
  @IsString()
  @MinLength(10)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]+$/, {
    message: 'password는 대문자, 소문자, 숫자, 특수문자를 포함해야 하며 공백을 사용할 수 없습니다.',
  })
  password!: string;
}

export class ChangePwdMemberDto {
  @ApiProperty({ description: '멤버 ID' })
  @IsString()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: '멤버 암호 (대소문자/숫자/특수문자 포함 10~64자)' })
  @IsString()
  @MinLength(10)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]+$/, {
    message: 'password는 대문자, 소문자, 숫자, 특수문자를 포함해야 하며 공백을 사용할 수 없습니다.',
  })
  oldPassword!: string;

  @ApiProperty({ description: '멤버 암호 (대소문자/숫자/특수문자 포함 10~64자)' })
  @IsString()
  @MinLength(10)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]+$/, {
    message: 'password는 대문자, 소문자, 숫자, 특수문자를 포함해야 하며 공백을 사용할 수 없습니다.',
  })
  newPassword!: string;
}

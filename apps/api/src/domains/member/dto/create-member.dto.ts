import { AuthLoginDto } from '@/domains/auth/dto/auth-login.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateMemberDto extends AuthLoginDto {
  @ApiProperty({ enum: MemberRole, example: MemberRole.DEVELOPER })
  @IsEnum(MemberRole)
  role!: MemberRole;
}

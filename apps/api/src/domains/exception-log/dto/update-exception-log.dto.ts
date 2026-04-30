import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExceptionLogStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateExceptionLogDto {
  @ApiPropertyOptional({ enum: ExceptionLogStatus, example: ExceptionLogStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(ExceptionLogStatus)
  status?: ExceptionLogStatus;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0000-000000000000', nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeMemberId?: string | null;
}

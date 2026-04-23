import { ApiProperty } from '@nestjs/swagger';
import { ExceptionLogStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateExceptionLogStatusDto {
  @ApiProperty({ enum: ExceptionLogStatus, example: ExceptionLogStatus.IN_PROGRESS })
  @IsEnum(ExceptionLogStatus)
  status!: ExceptionLogStatus;
}

export class AssignExceptionLogDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000', nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo!: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: '지갑을 생성할 대상 User ID (Wallet은 User에 종속)',
  })
  @IsUUID()
  userId!: string;
}

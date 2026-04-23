import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class SweepWalletDto {
  @ApiProperty({
    description: 'Sweep 대상 Wallet IDs',
  })
  @IsArray()
  ids!: string[];
}

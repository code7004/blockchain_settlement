import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestWalletBalanceDto {
  @ApiProperty({ example: 'TXXXX...' })
  @IsString()
  @IsNotEmpty()
  address!: string;
}

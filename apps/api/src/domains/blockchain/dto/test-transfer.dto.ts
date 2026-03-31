import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TestTransferDto {
  @ApiProperty({ example: 'PRIVATE_KEY' })
  @IsString()
  @IsNotEmpty()
  fromPrivateKey!: string;

  @ApiProperty({ example: 'TXXXX...' })
  @IsString()
  @IsNotEmpty()
  toAddress!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.000001)
  amount!: number;

  @ApiProperty({ example: 'mUSDT' })
  @IsString()
  @IsNotEmpty()
  tokenSymbol!: string;
}

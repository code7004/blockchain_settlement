import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsString, IsUUID } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 'uuid-partner-id', description: 'Partner UUID' })
  @IsUUID()
  partnerId!: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'User UUID' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 'uuid-wallet-id', description: 'Wallet UUID' })
  @IsUUID()
  walletId!: string;

  @ApiProperty({ example: 'mUSDT', description: 'TOKEN SYMBO ex) mUSDT, USDT' })
  @IsString()
  tokenSymbol!: string;

  @ApiProperty({ example: 'TW4JFMjGzYqycpuGBUfJeXGtbxXCyM1Dky', description: 'TRC20 contract address' })
  @IsString()
  tokenContract!: string;

  @ApiProperty({ example: 'Txxxxxxxxxxxxx', description: 'target wallet address' })
  @IsString()
  toAddress!: string;

  @ApiProperty({ example: '1', description: 'amount' })
  @IsDecimal()
  amount!: string;
}

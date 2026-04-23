import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User, WalletStatus } from '@prisma/client';
import { WalletService } from '../wallet/wallet.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGetUsersQueryDto } from './dto/get-user.query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly repo: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: dto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await this.repo.create(dto, tx);

        await this.walletService.createWalletByUser(user, tx);

        return user;
      });
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async findAll(query: AdminGetUsersQueryDto) {
    try {
      return await this.repo.findAll(query);
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async findOne(id: string): Promise<User> {
    return this.repo.findOne(id);
  }

  async findOneByExternalUserId(partnerId: string, externalUserId: string): Promise<User> {
    return this.repo.findOneByExternalUserId(partnerId, externalUserId);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: dto });

      if (dto.isActive !== undefined) {
        await tx.wallet.updateMany({
          where: { userId: id },
          data: { status: dto.isActive ? WalletStatus.ACTIVE : WalletStatus.SUSPENDED },
        });

        // todo: assets 반납
      }

      return user;
    });
  }

  //#############################################################################
  // for external api
}

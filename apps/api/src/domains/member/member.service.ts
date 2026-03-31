import { GetPartnersQueryDto } from '@/domains/partner/dto/get-partners.query.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberRepository } from './member.repository';

@Injectable()
export class MemberService {
  constructor(private readonly repo: MemberRepository) {}

  async create(dto: CreateMemberDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    return this.repo.create({
      username: dto.username,
      password: hashed,
      role: dto.role,
    });
  }

  async findAll(query: GetPartnersQueryDto) {
    return await this.repo.findAll(query);
  }

  async deleteUser(id: string) {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException('member not found');
    }

    if (!member.isActive) {
      throw new BadRequestException('member already inactive');
    }

    return this.repo.update(id, {
      isActive: false,
    });
  }

  async deleteUsers(ids: string[]) {
    const members = await this.repo.findByIds(ids);

    if (members.length !== ids.length) {
      throw new NotFoundException('Some members not found');
    }

    return this.repo.updateMany(ids, {
      isActive: false,
    });
  }
}

import { GetPartnersQueryDto } from '@/domains/partner/dto/get-partners.query.dto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
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

  async update(id: string, dto: UpdateMemberDto) {
    return await this.repo.update(id, dto);
  }

  async findAll(query: GetPartnersQueryDto) {
    return await this.repo.findAll(query);
  }
}

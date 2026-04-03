import { CreatePartnerDto } from '@/domains/partner/dto/create-partner.dto';
import { GetPartnersQueryDto } from '@/domains/partner/dto/get-partners.query.dto';
import { UpdatePartnerDto } from '@/domains/partner/dto/update-partner.dto';
import { PartnerRepository } from '@/domains/partner/partner.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DeleteByIdsPartnersDto } from './dto/delete-byids-partner.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly repo: PartnerRepository) {}

  async create(dto: CreatePartnerDto) {
    return this.repo.create(dto);
  }

  async findAll(query: GetPartnersQueryDto) {
    return await this.repo.findAll(query);
  }

  async findOne(id: string) {
    return await this.repo.findOne(id);
  }

  async update(id: string, dto: UpdatePartnerDto) {
    return await this.repo.update(id, dto);
  }

  /**
   * API Key 생성
   *
   * @param partnerId string
   */
  async createApiKey(partnerId: string) {
    const partner = await this.repo.findOne(partnerId);

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // 🔐 raw key 생성
    const raw = crypto.randomBytes(32).toString('hex');
    const prefix = raw.slice(0, 8);
    const apiKey = `${prefix}.${raw}`;

    // 🔐 hash 저장
    const hash = await bcrypt.hash(apiKey, 10);

    await this.repo.updateApiKeyHash(partnerId, hash, prefix);

    return { data: { apiKey } }; // ⚠️ 1회만 반환
  }

  /**
   * API Key 회전
   *
   * 기존 key 폐기 + 신규 발급
   */
  async rotate(partnerId: string) {
    return await this.createApiKey(partnerId);
  }

  async deleteUsers(dto: DeleteByIdsPartnersDto) {
    const members = await this.repo.findByIds(dto.ids);

    if (members.length !== dto.ids.length) {
      throw new NotFoundException('Some members not found');
    }

    return this.repo.updateMany(dto.ids, { isActive: false });
  }
}

import { Injectable } from '@nestjs/common';
import { GetSweepQueryDto } from './dto/get-sweep.query.dto';
import { SweepRepository } from './sweep.repository';

@Injectable()
export class SweepService {
  constructor(private readonly repo: SweepRepository) {}
  async findAll(query: GetSweepQueryDto) {
    return this.repo.findAll(query);
  }
}

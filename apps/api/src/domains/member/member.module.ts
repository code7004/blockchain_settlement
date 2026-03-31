import { Module } from '@nestjs/common';
import { AdminMemberController } from './member.controller';
import { MemberRepository } from './member.repository';
import { MemberService } from './member.service';

@Module({
  controllers: [AdminMemberController],
  providers: [MemberService, MemberRepository],
  exports: [MemberService],
})
export class MemberAdminModule {}

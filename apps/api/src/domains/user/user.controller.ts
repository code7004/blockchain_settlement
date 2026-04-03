import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PartnerId } from '../auth/decorators/partner-id.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto, CretaUserDto } from './dto/create-user.dto';
import { AdminGetUsersQueryDto, ApiGetUsersQueryDto } from './dto/get-user.query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User') // Swagger 그룹
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('users') // → /api/users (globalPrefix = 'api' 기준)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'User 생성',
    description: `
외부 서비스(Partner)에서 사용자(User)를 생성합니다.

✔ 생성 시 자동 처리:
- apiKey를 통해 자동으로 partnerId 자동 생성
- User 생성
- 해당 User의 Wallet 자동 생성 (1:1)

✔ 주의:
- externalUserId 중복 생성 불가
- Wallet address는 서버에서 자동 발급됩니다.
    `,
  })
  async create(@Body() dto: CretaUserDto, @PartnerId() partnerId: string) {
    return this.userService.create({ ...dto, partnerId });
  }

  @Get()
  @ApiOperation({
    summary: 'User 목록 조회',
    description: `
Partner에 속한 User 목록을 조회합니다.

✔ 특징:
- API Key 기준으로 partner 자동 필터링
- pagination / 필터 조건 지원

✔ 사용 목적:
- 사용자 목록 조회
- Wallet 연결 상태 확인
  `,
  })
  async findAll(@Query() query: ApiGetUsersQueryDto, @PartnerId() partnerId: string) {
    return this.userService.findAll({ ...query, partnerId });
  }

  @Get(':externalUserId')
  @ApiOperation({
    summary: 'User 상세 조회',
    description: `
특정 User의 상세 정보를 조회합니다.

✔ 포함 정보:
- User 기본 정보
- Wallet 정보 (address)

✔ 주의:
- 동일 partner 내 User만 조회 가능
  `,
  })
  async findOne(@Param('externalUserId') externalUserId: string, @PartnerId() partnerId: string) {
    return this.userService.findOneByExternalUserId(partnerId, externalUserId);
  }
}

@ApiTags('Portal - User')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  async findAll(@Query() query: AdminGetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'User 상세 조회',
    description: `
특정 User의 상세 정보를 조회합니다.

✔ 포함 정보:
- User 기본 정보
- Wallet 정보 (address)

✔ 주의:
- 동일 partner 내 User만 조회 가능
  `,
  })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'User 상태 변경',
    description: `
User의 활성/비활성 상태를 변경합니다.

✔ 변경 가능:
- isActive (true / false)

✔ 사용 목적:
- 사용자 이용 제한 (비활성화)
- 서비스 계정 관리

✔ 주의:
- 비활성화된 User는 신규 Wallet 생성 및 서비스 이용 제한 가능
  `,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}

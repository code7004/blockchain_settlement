import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminModules, ApiModules, AppModule } from './app.module';
import { ApiExceptionFilter } from './core/errors/api-exception.filter';
import { HttpLoggingInterceptor } from './core/logger/http-logging.interceptor';
import { AppLoggerService } from './core/logger/logger.service';

const apiDescription = `
### 이용 방법

1. Ballet portal > partner 등록 > 해당 파트너 API Key 발급
2. 발급받은 API Key를 Authorization 헤더에 포함
3. 이후 모든 API 요청 가능
4. Swagger이용시 Authorize버튼 클릭후 API Key 입력후 swagger이용 가능

---

### 인증 방식

\`\`\`
Authorization: Bearer {API_KEY}
\`\`\`

---

### 주의사항

- API Key는 외부에 노출되지 않도록 주의하세요
- 모든 요청은 Partner 기준으로 자동 필터링됩니다
  `;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. logger
  const logger = app.get(AppLoggerService);
  app.useGlobalInterceptors(new HttpLoggingInterceptor(logger));

  // 2. cross origin
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://d17qkco5bazjc3.cloudfront.net', 'https://d18zaroav2gl24.cloudfront.net/'];

  app.enableCors({
    origin: (origin: string, callback: (error: Error | null, check?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // 3. validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api', { exclude: ['/docs/(.*)'] });

  // 4. Swagger
  const apiConfig = new DocumentBuilder().setTitle('Chain Wallet API').setDescription(apiDescription).setVersion('1.0.0').addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'ApiKeyAuth').build();
  const adminConfig = new DocumentBuilder().setTitle('Chain Wallet Admin API').setDescription('Admin API').setVersion('1.0.0').addBearerAuth().build();

  // API Swagger
  const apiDocument = SwaggerModule.createDocument(app, apiConfig, { include: ApiModules });

  const isdev: boolean = process.env.NODE_ENV === 'development';

  // API Swagger
  SwaggerModule.setup('/docs/api', app, apiDocument, {
    swaggerOptions: isdev
      ? {
          persistAuthorization: true,
          authAction: {
            ApiKeyAuth: {
              name: 'ApiKeyAuth',
              schema: { type: 'apiKey', in: 'header', name: 'x-api-key' },
              value: process.env.DEV_API_KEY ?? '',
            },
          },
        }
      : undefined,
  });

  // Admin Swagger
  const adminDocument = SwaggerModule.createDocument(app, adminConfig, { include: AdminModules });

  SwaggerModule.setup('/docs/admin', app, adminDocument);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

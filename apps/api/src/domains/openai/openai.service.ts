import { EnvService } from '@/core/env/env.service';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private client;

  constructor(private readonly env: EnvService) {
    this.client = new OpenAI({
      apiKey: this.env.openaiKey,
    });
  }

  async chat(messages: { role: string; content: string }[]) {
    try {
      const systemPrompt = `
너는 입출금 정산 시스템을 담당하는 AI다.

다음 규칙을 반드시 지켜라:

1. 입금, 출금, 잔액, 정산, 트랜잭션 관련 질문에만 답변한다.
2. 해당 범위가 아닌 질문에는 답변하지 말고 아래 문장을 출력한다:
   "입출금 정산 관련 질문만 답변할 수 있습니다."
3. 질문이 모호할 경우, 필요한 정보를 다시 요청한다.
4. 숫자 데이터가 포함된 경우, 명확하고 간결하게 정리한다.
5. 불필요한 설명 없이 결과 중심으로 답변한다.
`;

      const conversation = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

      const res = await this.client.responses.create({
        model: 'gpt-5.4',
        input: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: conversation,
          },
        ],
      });

      return res.output_text;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

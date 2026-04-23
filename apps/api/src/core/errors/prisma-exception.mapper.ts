import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

function extractFieldFromConstraint(constraint?: string) {
  if (!constraint) return 'unknown';

  const match = constraint.match(/_(\w+)_fkey$/);
  return match ? match[1] : 'unknown';
}

export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta as Record<string, string>;
    const field = extractFieldFromConstraint(meta?.constraint);

    switch (error.code) {
      // Unique constraint
      case 'P2002':
        throw new ConflictException({
          code: 'DUPLICATE_KEY',
          message: 'Resource already exists',
          fields: meta?.target,
        });

      // Foreign key violation
      case 'P2003':
        throw new BadRequestException({
          code: 'INVALID_REFERENCE',
          message: `${field} does not exist`,
        });

      // Record not found
      case 'P2025':
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Resource not found',
        });

      // Value too long
      case 'P2000':
        throw new BadRequestException({
          code: 'VALUE_TOO_LONG',
          message: 'Value exceeds allowed length',
        });

      // Invalid data
      case 'P2006':
        throw new BadRequestException({
          code: 'INVALID_DATA',
          message: 'Invalid field value',
        });

      // Relation violation
      case 'P2014':
        throw new BadRequestException({
          code: 'INVALID_RELATION',
          message: 'Invalid relation request',
        });
      case 'P2023':
        throw new BadRequestException({
          code: 'INVALID_UUID',
          message: meta.message,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException({
      code: 'INVALID_REQUEST',
      message: 'Invalid request data',
    });
  }

  throw error;
}

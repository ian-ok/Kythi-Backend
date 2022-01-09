import type {ValidationResult} from 'joi';
import {PrismaClient} from '@prisma/client';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifySchema extends FastifySchema {
    validate?: (...any) => ValidationResult<any>;
  }
}
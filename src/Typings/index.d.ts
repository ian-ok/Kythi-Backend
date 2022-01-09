import type {ValidationResult} from 'joi';
import {PrismaClient} from '@prisma/client';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      MAIL_INFO: string;
      SESSION_KEY: string;
    }
  }

  interface User {
    id: string;
    uid: Number
    username: string
    email:string
    password: string
    createdAt: Date
    invited: string[]
    invitedBy: string
    invites?: Invite[]
    verifiedAt: Date | null
    verificationCode: string | null
  }

  interface Invite {
    code: string
    createdBy: string
    createdAt: Date
    user: User
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface PassportUser extends User {}

  interface FastifySchema extends FastifySchema {
    validate?: (...any) => ValidationResult<any>;
  }
}
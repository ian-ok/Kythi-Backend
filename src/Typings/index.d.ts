import type { ValidationResult } from "joi";
import { PrismaClient } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      MAIL_INFO: string;
      SESSION_KEY: string;
      FRONTEND_URL: string;
      DATABASE_URL: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_OAUTH_SCOPES: string;
      DISCORD_CLIENT_SECRET: string;
    }
  }

  interface User {
    id: string;
    uid: Number;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    invited: string[];
    invitedBy: string;
    invites?: Invite[];
    verifiedAt: Date | null;
    verificationCode: string | null;
    discordId: string | null;
    discord?: Discord;
  }

  interface Invite {
    code: string;
    createdBy: string;
    createdAt: Date;
    user?: User;
  }

  interface Discord {
    id: string;
    username: string;
    discriminator: string;
    tag: string;
    avatar: string;
    banner?: string;
    bannerColor?: string;
    createdAt: Date;
    nitroType: "NONE" | "CLASSIC" | "PREMIUM";
    user?: User;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface PassportUser extends User {}

  interface FastifySchema extends FastifySchema {
    validate?: (...any) => ValidationResult<any>;
  }
}
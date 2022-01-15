import type { ValidationResult } from "joi";
import { File } from "fastify-multer/lib/interfaces";
import { PrismaClient, User, Invite, Discord, UploadSettings } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      S3_INFO: string;
      MAIL_INFO: string;
      S3_BUCKET: string;
      SESSION_KEY: string;
      FRONTEND_URL: string;
      DATABASE_URL: string;
      TESTIMONY_CHANNEL: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_OAUTH_SCOPES: string;
      DISCORD_CLIENT_SECRET: string;
    }
  }

  interface PassportUser extends User {
    invites: Invite[];
    discord: Discord;
    upload: UploadSettings;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface PassportUser extends User {
    invites: Invite[];
    discord: Discord;
    upload: UploadSettings;
  }

  interface FastifySchema extends FastifySchema {
    validate?: (...any) => ValidationResult<any>;
  }

  interface FastifyRequest {
    file?: File;
  }
}

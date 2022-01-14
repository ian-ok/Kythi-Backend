import type { ValidationResult } from "joi";
import { PrismaClient } from "@prisma/client";
import { File } from "fastify-multer/lib/interfaces";

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
    uploadKey: string;
    upload: UploadSettings;
    uploads?: DbFile[]
    testimonial?: Testimonial;
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

  interface UploadSettings {
    key: string;
    count: number;
    user?: User;
  }

  interface DbFile {
    fileName: string;
    cdnName: string;
    mimeType: string;
    size: number;
    path: string;
    domain: string;
    uploadedAt: Date;
    uploaderId: string;
    uploader?: User;
  }

  interface Testimonial {
    id: string
    content: string
    verified: boolean
    messageId: string
    authorId: string
    author?: User;
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

  interface FastifyRequest {
    file?: File;
  }
}

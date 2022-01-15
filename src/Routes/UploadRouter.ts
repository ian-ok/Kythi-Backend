import fastifyMulter from 'fastify-multer';
import type {FastifyInstance} from 'fastify';
import {uploadFile} from '../Utility/Storage';
import {File} from 'fastify-multer/lib/interfaces';
import {generateRandomString} from '../Utility/Misc';
import {verifyUser, verifyFile} from '../Middlewares/UploadMiddlewares';
import {discordLinked, emailVerified} from '../Middlewares/MiscMiddlewares';

const multer = fastifyMulter({
  storage: fastifyMulter.memoryStorage(),
  limits: {
    fileSize: 100 * 1000 * 1000,
  },
});

interface verifiedFile extends File {
  size: number;
  buffer: Buffer;
}

export default async function UploadRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.post(
      '/sharex',
      {preHandler: [verifyUser, emailVerified, discordLinked, multer.single('file'), verifyFile]},
      async (request, reply) => {
        const {
          file: reqFile,
          user,
          headers: {authorization},
        } = request as {
            file: verifiedFile;
            user: PassportUser;
            headers: { authorization: string };
        };

        const fileName =
        generateRandomString(10) + '.' + reqFile.mimetype.split('/')[1];

        const file = await prisma.file.create({
          data: {
            fileName,
            cdnName: fileName,
            mimeType: reqFile.mimetype,
            size: reqFile.size,
            path: '/',
            domain:
            reqFile.mimetype.split('/')[0] === 'image' ?
              'kythi.pics' :
              'kythi.media',
            uploaderId: user.id,
          },
        });

        await prisma.uploadSettings.update({
          where: {key: authorization},
          data: {count: {increment: 1}},
        });

        uploadFile(file, reqFile.buffer);

        reply.send({
          imageURL: `https://${file.domain}${file.path}${file.fileName}`,
        });
      }
  );
}

export const autoPrefix = '/upload';

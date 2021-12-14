import multer from 'fastify-multer';
import {File} from '../Models/File';
import {User} from '../Models/User';
import type {FastifyInstance} from 'fastify';
import {uploadFile} from '../Utility/Storage';
import {File as FileType} from 'fastify-multer/lib/interfaces';
import {verifyFile, verifyUser} from '../Middlewares/UploadMiddlewares';
import {formatEmbed, generateRandomString, sendReply} from '../Utility';

interface fileWithBuffer extends FileType {
  buffer: Buffer;
}

const upload = multer({
  storage: multer.memoryStorage(),
});

/**
  The Router
  @param {FastifyInstance} fastify
*/
export default async function UploadRouter(fastify: FastifyInstance) {
  fastify.post(
      '/sharex',
      {preHandler: [verifyUser, upload.single('file'), verifyFile]},
      async (request, reply) => {
        const {file: reqFile, user} = request as {
          file: fileWithBuffer;
          user: User;
        };

        const embeds = user.upload.settings.embeds;

        user.upload.count++;
        await user.save();

        const file = new File();
        file.cdnName =
        generateRandomString(10) + '.' + reqFile.mimetype.split('/')[1];
        file._id = file.cdnName;
        file.mimeType = reqFile.mimetype;
        file.size = reqFile.size;
        file.path = '/';
        file.uploader._id = user._id;
        file.uploader.username = user.username;
        file.embed = formatEmbed(
            embeds[Math.floor(Math.random() * embeds.length)],
            file,
            user,
        );
        await file.save();

        uploadFile(file, reqFile.buffer);

        return sendReply(reply, 200, 'Successfully uploaded', {
          imageURL: `${process.env.CDN_URL}/${file._id}`,
        });
      },
  );
}

export const autoPrefix = '/upload';

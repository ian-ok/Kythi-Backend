import {User} from '../Models/User';
import {File} from '../Models/File';
import type {FastifyInstance} from 'fastify';

/**
  The Router
  @param {FastifyInstance} fastify
*/
export default async function BaseRouter(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return {statusCode: 200, message: 'Hello World!'};
  });

  fastify.get('/stats', async () => {
    const userCount = await User.estimatedDocumentCount();
    const fileCount = await File.estimatedDocumentCount();

    return {
      userCount,
      fileCount,
      bannedCount: null,
      domainCount: null,
    };
  });
}

export const autoPrefix = '/';

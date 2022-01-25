import Joi from 'joi';
import type {FastifyInstance} from 'fastify';

interface EditEmbedParams {
  id: string;
}

interface EditEmbedBody {
  enabled: boolean;
  title: string | null;
  description: string | null;
  color: string;
  siteText: string | null;
  siteUrl: string | null;
  authorText: string | null;
  authorUrl: string | null;
}

export default async function EmbedRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.patch<{ Params: EditEmbedParams; Body: EditEmbedBody }>(
      '/:id',
      {
        schema: {
          body: Joi.object().keys({
            enabled: Joi.boolean().required(),
            title: Joi.string().required().allow(null),
            description: Joi.string().required().allow(null),
            color: Joi.string().required(),
            siteText: Joi.string().required().allow(null),
            siteUrl: Joi.string().required().allow(null),
            authorText: Joi.string().required().allow(null),
            authorUrl: Joi.string().required().allow(null),
          }),
        },
      },
      async (request, reply) => {
        const {user} = request;
        const {id} = request.params;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to modify your embed settings.',
          });
        }

        const embed = await prisma.userEmbed.findFirst({where: {id}});

        if (!embed || embed.userId !== user.id) {
          return reply.code(400).send({
            statusCode: 400,
            message: 'You do not have permission to modify this embed.',
          });
        }

        await prisma.userEmbed.update({
          where: {id},
          data: request.body,
        });

        return reply.send({
          statusCode: 200,
          message: 'Successfully updated embed settings.',
        });
      }
  );
}

export const autoPrefix = '/users/@me/settings/embeds';

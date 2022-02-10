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

  fastify.post<{ Body: EditEmbedBody }>(
      '/',
      {
        schema: {
          body: Joi.object()
              .keys({
                enabled: Joi.boolean().required(),
                title: Joi.string().required().allow(null),
                description: Joi.string().required().allow(null),
                color: Joi.string().required(),
                siteText: Joi.string().required().allow(null),
                siteUrl: Joi.string().required().allow(null),
                authorText: Joi.string().required().allow(null),
                authorUrl: Joi.string().required().allow(null),
              })
              .allow(null),
        },
      },
      async (request, reply) => {
        const {user, body} = request;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to modify your embed settings.',
          });
        }

        if (user.embeds.length >= 10) {
          return reply.code(400).send({
            statusCode: 400,
            message: 'You cannot have more than 10 embeds.',
          });
        }

        const embed = await prisma.userEmbed.create({
          data: {
            ...body,
            userId: user.id,
          },
        });

        return {
          statusCode: 200,
          message: 'Successfully created embed profile',
          embed,
        };
      }
  );

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
      // const {user} = request;
        const user = await prisma.user.findFirst({
          where: {uid: 1},
          include: {embeds: true},
        });
        const {id} = request.params;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to modify your embed settings.',
          });
        }

        if (!user.embeds.some((embed) => embed.id === id)) {
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

  fastify.delete<{ Params: EditEmbedParams }>(
      '/:id',
      async (request, reply) => {
      // const {user} = request;
        const user = await prisma.user.findFirst({
          where: {uid: 1},
          include: {embeds: true},
        });
        const {id} = request.params;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to modify your embed settings.',
          });
        }

        if (!user.embeds.some((embed) => embed.id === id)) {
          return reply.code(400).send({
            statusCode: 400,
            message: 'You do not have permission to modify this embed.',
          });
        }

        if (user.embeds.length === 1) {
          return reply.code(400).send({
            statusCode: 400,
            message: 'You must have at least one embed profile.',
          });
        }

        const deletedEmbed = await prisma.userEmbed.delete({where: {id}});

        return reply.send({
          statusCode: 200,
          message: 'Successfully deleted embed profile.',
          embed: deletedEmbed,
        });
      }
  );
}

export const autoPrefix = '/users/@me/settings/embeds';

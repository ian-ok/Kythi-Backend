import Joi from 'joi';
import {AxiosError} from 'axios';
import type {FastifyInstance} from 'fastify';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import {
  discordLinked,
  emailVerified,
} from '../../../Middlewares/MiscMiddlewares';
import {
  getDiscordMessage,
  sendDiscordMessage,
  editDiscordMessage,
  deleteDiscordMessage,
} from '../../../Utility/Misc';

interface TesimonialCreate {
  content: string;
}

export default async function TestimonialRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/', async (request, reply) => {
    const {user} = request;

    if (!user) {
      return reply.code(401).send({
        statusCode: 401,
        message: 'You must be logged in to create a testimonial.',
      });
    }

    const testimony = await prisma.testimonial.findFirst({
      where: {authorId: user.id},
    });

    if (!testimony) return reply.code(400).send({statusCode: 400, message: 'No Testimony Found'});

    return {
      statusCode: 200,
      message: 'Successfully retrieved testimony',
      testimony,
    };
  });

  fastify.post<{ Body: TesimonialCreate }>(
      '/',
      {
        schema: {
          body: Joi.object().keys({
            content: Joi.string()
                .required()
                .min(20)
                .max(108)
                .pattern(/^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]+$/),
          }),
        },
        preHandler: [emailVerified, discordLinked],
      },
      async (request, reply) => {
        const {
          user,
          body: {content},
        } = request;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to create a testimonial.',
          });
        }

        if (
          await prisma.testimonial.findFirst({where: {authorId: user.id}})
        ) {
          return {statusCode: 400, message: 'You already have a testimonial.'};
        }

        const testimony = await prisma.testimonial.create({
          data: {
            content,
            authorId: user.id,
          },
        });

        try {
          const messageData = await sendDiscordMessage(
              process.env.TESTIMONY_CHANNEL,
              {
                embeds: [
                  {
                    author: {
                      name: `${user.username}'s Testimonial`,
                      icon_url: user.discord?.avatar,
                    },
                    description: content,
                    color: 39423,
                    footer: {text: `Testimony ID: ${testimony.id}`},
                    timestamp: new Date().toISOString(),
                  },
                ],
                components: [
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        custom_id: `testimonial-accept-${testimony.id}`,
                        style: 3,
                        label: 'Accept',
                      },
                      {
                        type: 2,
                        custom_id: `testimonial-deny-${testimony.id}`,
                        style: 4,
                        label: 'Deny',
                      },
                    ],
                  },
                ],
              }
          );

          await prisma.testimonial.update({
            where: {id: testimony.id},
            data: {messageId: messageData.id},
          });

          return reply.send({
            statusCode: 200,
            message: 'Testimonial created. Sent for approval.',
          });
        } catch (err) {
          return reply.send({
            statusCode: 500,
            message:
            'An error occurred while sending the testimonial to the server.',
          });
        }
      }
  );

  fastify.patch<{ Body: TesimonialCreate }>('/', {schema: {
    body: Joi.object().keys({
      content: Joi.string()
          .required()
          .min(20)
          .max(108)
          .pattern(/^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]+$/),
    }),
  }, preHandler: [emailVerified, discordLinked]}, async (request, reply) => {
    const {user, body: {content}} = request;

    if (!user) {
      return reply.code(401).send({
        statusCode: 401,
        message: 'You must be logged in to modify your testimonial.',
      });
    }

    const oldTestimonial = await prisma.testimonial.findFirst({
      where: {authorId: user.id},
    });

    if (!oldTestimonial) {
      return reply.send({
        statusCode: 400,
        message: 'You do not have a testimonial.',
      });
    } else if (oldTestimonial.content == content) {
      return reply.send({
        statusCode: 400,
        message: 'The testimonial has no content change.',
      });
    }

    try {
      const oldMessage = await getDiscordMessage(
          process.env.TESTIMONY_CHANNEL,
          oldTestimonial.messageId as string
      ).catch(() => null);

      if (oldMessage && oldTestimonial.messageId) {
        await editDiscordMessage(
            process.env.TESTIMONY_CHANNEL,
            oldTestimonial.messageId,
            {
              embeds: oldMessage.embeds.map((e) => ({
                ...e,
                author: {...e.author, name: e.author?.name.split(' ').join(' Old ')},
              })),
              components: oldMessage.components?.map((c) => ({
                ...c,
                components: c.components.map((comp) => ({
                  ...comp,
                  disabled: true,
                })),
              })),
            }
        );
      }

      const messageData = await sendDiscordMessage(
          process.env.TESTIMONY_CHANNEL,
          {
            embeds: [
              {
                author: {
                  name: `${user.username}'s Modified Testimonial`,
                  icon_url: user.discord?.avatar,
                },
                description: content,
                color: 39423,
                footer: {text: `Testimony ID: ${oldTestimonial.id}`},
                timestamp: new Date().toISOString(),
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    custom_id: `testimonial-accept-${oldTestimonial.id}`,
                    style: 3,
                    label: 'Accept',
                  },
                  {
                    type: 2,
                    custom_id: `testimonial-deny-${oldTestimonial.id}`,
                    style: 4,
                    label: 'Deny',
                  },
                ],
              },
            ],
            message_reference: oldMessage ?
              {message_id: oldMessage.id} :
              null,
          });

      await prisma.testimonial.update({
        where: {id: oldTestimonial.id},
        data: {messageId: messageData.id, content},
      });

      return reply.send({
        statusCode: 200,
        message: 'Testimonial updated. Sent for approval.',
      });
    } catch (err) {
      return reply.send({
        statusCode: 500,
        message:
        'An error occurred while modifiying your testimonial on the server.',
      });
    }
  });

  fastify.delete(
      '/',
      {preHandler: [emailVerified, discordLinked]},
      async (request, reply) => {
        const {user} = request;

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            message: 'You must be logged in to delete your testimonial.',
          });
        }

        try {
          const testimony = await prisma.testimonial.delete({
            where: {authorId: user.id},
          });

          const oldMessage = await getDiscordMessage(
              process.env.TESTIMONY_CHANNEL,
              testimony.messageId as string
          ).catch(() => null);

          if (oldMessage && !testimony.verified && testimony.messageId) {
            await editDiscordMessage(
                process.env.TESTIMONY_CHANNEL,
                testimony.messageId,
                {
                  embeds: oldMessage.embeds.map((e) => ({
                    ...e,
                    author: {...e.author, name: `${e.author?.name.split(' ')[0]} Deleted Testimonial`},
                  })),
                  components: oldMessage.components?.map((c) => ({
                    ...c,
                    components: c.components.map((comp) => ({
                      ...comp,
                      disabled: true,
                    })),
                  })),
                }
            );
          } else if (oldMessage && testimony.messageId) {
            await deleteDiscordMessage(process.env.TESTIMONY_CHANNEL, testimony.messageId, 'Testimonial Deleted');
          }

          return reply.send({
            statusCode: 200,
            message: 'Testimonial deleted.',
          });
        } catch (err) {
          if ((err as AxiosError).response) {
            return reply.send({
              statusCode: 200,
              message: 'Testimonial deleted.',
            });
          } else if ((err as PrismaClientKnownRequestError).code === 'P2025') {
            return reply.send({
              statusCode: 400,
              message: 'You do not have a testimonial.',
            });
          }

          return reply.send({
            statusCode: 500,
            message:
            'An error occurred while deleting your testimonial from the server.',
          });
        }
      }
  );
}

export const autoPrefix = '/users/@me/testimonials';

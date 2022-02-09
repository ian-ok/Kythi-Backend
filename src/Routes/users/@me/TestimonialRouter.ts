import Joi from 'joi';
import cuid from 'cuid';
import type {FastifyInstance} from 'fastify';
import Embed from '../../../Utility/Classes/Embed';
import Button from '../../../Utility/Classes/Button';
import {sendDiscordMessage} from '../../../Utility/Misc';
import ActionRow from '../../../Utility/Classes/ActionRow';

interface TesimonialCreate {
  content: string;
}

export default async function TestimonialRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

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

        if (user.testimonial) {
          return reply
              .code(400)
              .send({
                statusCode: 400,
                message: 'You already have a testimonial.',
              });
        }

        try {
          const testimonyId = cuid();
          const messageData = await sendDiscordMessage(
              process.env.TESTIMONY_CHANNEL,
              {
                embeds: [
                  new Embed()
                      .setAuthor({
                        name: `${user.username}'s Testimonial`,
                        icon_url: user.discord?.avatar,
                      })
                      .setDescription(content)
                      .setColor(39423)
                      .setFooter({text: `Testimony ID: ${testimonyId}`})
                      .setTimestamp()
                      .toJSON(),
                ],
                components: [
                  new ActionRow()
                      .addComponent(
                          new Button()
                              .setLabel('Accept')
                              .setStyle('SUCCESS')
                              .setCustomId(`testimonial-accept-${testimonyId}`)
                      )
                      .addComponent(
                          new Button()
                              .setLabel('Deny')
                              .setStyle('DANGER')
                              .setCustomId(`testimonial-deny-${testimonyId}`)
                      )
                      .toJSON(),
                ],
              }
          );

          const testimonial = await prisma.testimonial.create({
            data: {
              id: testimonyId,
              content,
              authorId: user.id,
              messageId: messageData.id,
            },
          });

          return reply.send({
            statusCode: 200,
            message: 'Testimonial created. Sent for approval.',
            testimonial,
          });
        } catch (err: any) {
          return reply.code(500).send({
            statusCode: 500,
            message:
            'An error occurred while sending the testimonial to the server.',
          });
        }
      }
  );
}

export const autoPrefix = '/users/@me/testimonials';

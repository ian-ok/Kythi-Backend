import Joi from 'joi';
import type {FastifyInstance} from 'fastify';
import {isAuthorized} from '../../Middlewares/MiscMiddlewares';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';

interface PatchParams {
  id: string;
}

interface PatchBody {
  accepted: boolean;
}

export default async function TestimonialRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/', async () => {
    const testimonalCount = await prisma.testimonial.count();

    const testimonials = await prisma.testimonial.findMany({
      where: {verified: true},
      include: {author: {include: {discord: true}}},
      take: 3,
      skip: Math.floor(Math.random() * testimonalCount),
    });

    const filteredTestimonials = testimonials.map((t) => {
      return {
        text: t.content,
        author: {
          username: t.author.username,
          avatarURL: t.author.discord?.avatar,
        },
      };
    });

    return {
      statusCode: 200,
      message: 'Successfully retrieved testimonials.',
      testimonials: filteredTestimonials,
    };
  });

  fastify.patch<{Params: PatchParams, Body: PatchBody}>('/:id', {
    schema: {
      body: Joi.object().keys({
        accepted: Joi.boolean().required(),
      }),
    },
    preHandler: [isAuthorized],
  }, async (request, reply) => {
    const {body: {accepted}, params: {id}} = request;

    try {
      await prisma.testimonial.update({
        where: {id},
        data: {
          verified: accepted,
        },
      });

      return reply.send({
        statusCode: 200,
        message: 'Successfully updated testimonial.',
      });
    } catch (err) {
      if ((err as PrismaClientKnownRequestError).code === 'P2025') {
        return reply.code(400).send({
          statusCode: 400,
          message: 'Invalid Testimonial ID.',
        });
      }

      return reply.code(500).send({
        statusCode: 500,
        message: 'An unexpected error occurred.',
      });
    }
  });
}

export const autoPrefix = '/users/testimonials';

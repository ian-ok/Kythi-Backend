import Joi from 'joi';
import type {FastifyInstance} from 'fastify';
import {sendReply} from '../Utility';

interface registerParams {
  username: string;
  email: string;
  password: string;
  inviteCode: string;
}

/**
  The Router
  @param {FastifyInstance} fastify
*/
export default async function BaseRouter(fastify: FastifyInstance) {
  fastify.get<{Querystring: registerParams}>('/register', async (request, reply) => {
    const registerSchema = Joi.object().keys({
      username: Joi.string()
          .required()
          .min(4)
          .max(24)
          .pattern(/^[a-zA-Z0-9_]+$/),
      password: Joi.string().min(6).max(100).required(),
      email: Joi.string().required().email().lowercase(),
      inviteCode: Joi.string().required(),
      hCaptchaKey: Joi.string().required(),
    });

    try {
      await registerSchema.validateAsync(request.query);

      sendReply(reply, 200, 'Valid Parameters', {success: true});
    } catch (e: unknown) {
      const error = e as Joi.ValidationError;
      sendReply(reply, 400, error.details[0].message, {success: false});
    }
  });
}

export const autoPrefix = '/validate';

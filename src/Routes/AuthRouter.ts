import Joi from 'joi';
import {hash} from 'argon2';
import type {FastifyInstance} from 'fastify';
import {allowedEmails} from '../Utility/Constants';

interface registerBody {
  username: string;
  email: string;
  password: string;
  inviteCode: string;
}

export default async function AuthRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.post<{Body: registerBody}>(
      '/register',
      {
        schema: {
          body: Joi.object().keys({
            username: Joi.string()
                .required()
                .min(4)
                .max(24)
                .pattern(/^[a-zA-Z0-9_]+$/),
            password: Joi.string().min(4).max(60).required(),
            email: Joi.string().required().email().lowercase(),
            inviteCode: Joi.string().required(),
          }),
        },
      },
      async (request, reply) => {
        const {username, password, email, inviteCode: code} = request.body;
        const inviteUsed = await prisma.invite.findFirst({
          where: {code},
        });
        reply.code(400);

        if (!inviteUsed) {
          return {statusCode: 400, message: 'Invalid Invite Code.'};
        }

        if (!allowedEmails.includes(email.split('@')[1])) {
          return {
            statusCode: 400,
            message:
            'Your email domain is unsupported. Try again with another email.',
          };
        }

        if (
          await prisma.user.findFirst({
            where: {
              OR: [
                {
                  username: {
                    equals: username,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    equals: email,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          })
        ) {
          return {
            statusCode: 400,
            message: `The username or email provided is taken.`,
          };
        }

        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: await hash(password),
            invitedBy: inviteUsed.createdBy,
          },
        });

        await prisma.user.update({
          where: {id: inviteUsed.createdBy},
          data: {
            invited: {
              push: newUser.id,
            },
          },
        });

        await prisma.invite.delete({
          where: {code: inviteUsed.code},
        });

        reply.code(200).send({statusCode: 200, message: 'Successfully registered.'});
      }
  );
}

export const autoPrefix = '/auth';

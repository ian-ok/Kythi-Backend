import Joi from 'joi';
import {hash} from 'argon2';
import type {FastifyInstance} from 'fastify';
import {verifyMail} from '../../Utility/Mail';
import fastifyPassport from 'fastify-passport';
import {allowedEmails} from '../../Utility/Constants';
import {emailVerified} from '../../Middlewares/MiscMiddlewares';

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
                .pattern(/^\w+$/),
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

        const uploadSettings = await prisma.uploadSettings.create({data: {}});

        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: await hash(password),
            invitedBy: inviteUsed.createdBy,
            uploadKey: uploadSettings.key,
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
        verifyMail(newUser);

        reply.code(200).send({statusCode: 200, message: 'Successfully registered! Check your email for verification.'});
      }
  );

  fastify.get('/session', async (request, reply) => {
    if (!request.user) {
      reply.code(400).send({statusCode: 400, message: 'No session found.', user: null});
    }

    return {statusCode: 200, message: 'Session located.', user: request.user};
  });

  fastify.post('/logOut', async (request, reply) => {
    if (!request.user) return reply.code(400).send({statusCode: 400, message: 'No session found.'});

    request.logOut();
    reply.code(200).send({statusCode: 200, message: 'Successfully logged out.'});
  });

  fastify.post('/login', {
    schema: {
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }),
    },
    preHandler: [fastifyPassport.authenticate('local', async function(request, reply, _, user) {
      if (!user) {
        return reply
            .code(400)
            .send({statusCode: 400, message: 'Invalid username or password.'});
      }

      request.logIn(user);
    }), emailVerified],
  }, async (request) => {
    return {statusCode: 200, message: 'Successfully logged in', user: request.user};
  });
}

export const autoPrefix = '/auth';

import type {FastifyInstance} from 'fastify';

interface verifyParams {
  verificationCode: string;
}

export default async function VerifyRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get<{Params:verifyParams}>('/mail/:verificationCode', async (request, reply) => {
    const {verificationCode} = request.params;
    const userToVerify = await prisma.user.findFirst({
      where: {verificationCode},
    });

    if (!userToVerify) {
      return reply.code(400).send({statusCode: 400, message: 'Invalid verification code'});
    }

    await prisma.user.update({
      where: {id: userToVerify.id},
      data: {verifiedAt: new Date(), verificationCode: null},
    });

    return {statusCode: 200, message: 'Verification successful'};
  });
}

export const autoPrefix = '/verify';

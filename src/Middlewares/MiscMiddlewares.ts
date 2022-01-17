import {FastifyRequest, FastifyReply} from 'fastify';

export async function emailVerified(
    request: FastifyRequest,
    reply: FastifyReply
) {
  if (request.user && !request.user.verifiedAt) {
    return reply
        .status(400)
        .send({
          statusCode: 400,
          message: 'Verify your email and try again.',
        });
  }
}

export async function isAuthorized(
    request: FastifyRequest,
    reply: FastifyReply
) {
  if (request.headers.authorization !== process.env.API_KEY) {
    return reply.status(401).send({
      statusCode: 401,
      message: 'Unauthorized.',
    });
  }
}

export async function discordLinked(
    request: FastifyRequest,
    reply: FastifyReply
) {
  if (request.user && !request.user.discordId) {
    return reply
        .status(400)
        .send({
          statusCode: 400,
          message: 'Link your discord account and try again.',
        });
  }
}

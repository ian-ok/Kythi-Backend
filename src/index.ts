import 'dotenv/config';
import {join} from 'path';
import fastify from 'fastify';
import {verify} from 'argon2';
import fastifyCors from 'fastify-cors';
import {Strategy} from 'passport-local';
import fastifyHelmet from 'fastify-helmet';
import fastifyMulter from 'fastify-multer';
import fastifyAutoload from 'fastify-autoload';
import fastifyPassport from 'fastify-passport';
import {PrismaClient, User} from '@prisma/client';
import fastifyRateLimit from 'fastify-rate-limit';
import fastifySecureSession from 'fastify-secure-session';

const server = fastify({
  trustProxy: true,
});
server.prisma = new PrismaClient();

server.register(fastifyHelmet);

server.register(fastifyCors, {
  origin: ['https://kythi.com', /^http:\/\/localhost:\d+$/],
  credentials: true,
});

server.register(fastifyRateLimit, {
  timeWindow: 1000 * 60,
  max: 20,
});

server.register(fastifySecureSession, {
  key: Buffer.from(process.env.SESSION_KEY, 'hex'),
  cookie: {
    path: '/',
  },
});

server.register(fastifyMulter.contentParser);
server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

fastifyPassport.use(new Strategy(async (username, password, done) => {
  const user = await server.prisma.user.findFirst({
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
            equals: username,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      discord: true,
      upload: true,
      invites: true,
      embeds: true,
      testimonial: true,
    },
  });

  if (!user || (await verify(user.password, password)) === false) {
    return done(null, false);
  }

  return done(null, user);
}));
fastifyPassport.registerUserSerializer(async (user: User) => user.id);
fastifyPassport.registerUserDeserializer(
    async (id: string) =>
      await server.prisma.user.findFirst({
        where: {id},
        include: {
          discord: true,
          upload: true,
          invites: true,
          embeds: true,
          testimonial: true,
        },
      })
);

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
});

server.setValidatorCompiler(({schema}) => {
  return (data) => schema.validate ? schema.validate(data) : null;
});

server.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) throw err;

  console.log(`Listening on http://127.0.0.1:${process.env.PORT}/`);
});

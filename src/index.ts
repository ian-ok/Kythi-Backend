import 'dotenv/config';
import {join} from 'path';
import fastify from 'fastify';
import {verify} from 'argon2';
import {connect} from 'mongoose';
import {request} from './Utility';
import {User} from './Models/User';
import fastifyCors from 'fastify-cors';
import {Strategy} from 'passport-local';
import fastifyHelmet from 'fastify-helmet';
import fastifyMulter from 'fastify-multer';
import fastifyAutoload from 'fastify-autoload';
import fastifyPassport from 'fastify-passport';
import fastifyRateLimit from 'fastify-rate-limit';
import fastifySecureSession from 'fastify-secure-session';

const server = fastify({
  trustProxy: true,
});

server.setValidatorCompiler(({schema}) => {
  return (data) => schema.validate ? schema.validate(data) : null;
});

server.setNotFoundHandler((_, reply) => {
  return reply
      .code(404)
      .send('Thats a Four Oh Four. We couldn\'t find that endpoint.');
});

server.register(fastifyHelmet);
server.register(fastifyMulter.contentParser);
server.register(fastifyCors, {
  origin: [/^http:\/\/localhost:\d{0,4}$/, 'https://kythi.com'],
  credentials: true,
});
server.register(fastifyRateLimit, {
  timeWindow: 1000,
  max: 2,
});

server.register(fastifySecureSession, {
  key: Buffer.from(process.env.COOKIE_KEY, 'hex'),
  cookie: {
    path: '/',
    expires: new Date(Date.now() + 60 * 60 * 1000),
  },
});

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

fastifyPassport.use(
    new Strategy((username, password, done) => {
      User.findOne(
          {$or: [{username}, {email: username}]},
          async (err: Error, user: User) => {
            if (err) {
              return done(err);
            }

            if (!user || !(await verify(user.password, password))) {
              return done(null, false);
            }

            return done(null, user);
          },
      );
    }),
);

fastifyPassport.registerUserSerializer(async (user: User) => user._id);
fastifyPassport.registerUserDeserializer(
    async (id: string) => await User.findById(id),
);

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
});

server.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) throw err;

  connect(process.env.MONGO_URI, {keepAlive: true}, (err) => {
    if (err) throw err;
  });

  if (process.env.NODE_ENV === 'production') {
    void request(process.env.DOCKER_STARTUP_WEBHOOK_URL, 'POST', {
      body: {
        username: 'Docker Logs',
        avatar_url:
          'https://cdn.discordapp.com/attachments/803816121047318529/915951319527874600/docker_facebook_share.png',
        content: 'Backend is up and running on docker!',
      },
    });
  }

  console.log(`Listening on http://127.0.0.1:${process.env.PORT}/`);
  console.log('Connected to MongoDB');
});

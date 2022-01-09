import 'dotenv/config';
import {join} from 'path';
import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyHelmet from 'fastify-helmet';
import {PrismaClient} from '@prisma/client';
import fastifyAutoload from 'fastify-autoload';
import fastifyRateLimit from 'fastify-rate-limit';

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

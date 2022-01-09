import 'dotenv/config';
import {join} from 'path';
import fastify from 'fastify';
import {PrismaClient} from '@prisma/client';
import fastifyAutoload from 'fastify-autoload';

const server = fastify();
server.prisma = new PrismaClient();

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

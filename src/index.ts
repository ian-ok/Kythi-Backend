import 'dotenv/config';
import {join} from 'path';
import fastify from 'fastify';
import fastifyAutoload from 'fastify-autoload';

const server = fastify();

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
});

server.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) throw err;

  console.log(`Listening on http://127.0.0.1:${process.env.PORT}/`);
});

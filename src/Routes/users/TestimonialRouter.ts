import type {FastifyInstance} from 'fastify';

export default async function TestimonialRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/', async () => {
    const testimonalCount = await prisma.testimonial.count();

    const testimonials = await prisma.testimonial.findMany({
      where: {verified: true},
      include: {author: {include: {discord: true}}},
      take: 3,
      skip: Math.floor(Math.random() * testimonalCount),
    });

    const filteredTestimonials = testimonials.map((t) => {
      return {
        text: t.content,
        author: {
          username: t.author.username,
          avatarURL: t.author.discord?.avatar,
        },
      };
    });

    return {
      statusCode: 200,
      message: 'Successfully retrieved testimonials.',
      testimonials: filteredTestimonials,
    };
  });
}

export const autoPrefix = '/users/testimonials';

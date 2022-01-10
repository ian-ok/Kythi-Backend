import {AxiosError} from 'axios';
import {getColor} from 'colorthief';
import {randomBytes} from 'node:crypto';
import type {FastifyInstance} from 'fastify';
import {OAuthURLS} from '../../Utility/Constants';
import {getAvatarURL, rgbToHex} from '../../Utility/Misc';
import {req, encodeURL, paramBuilder} from '../../Utility/Requests';

const states = new Set<string>();
interface loginCallbackQuery {
  code: string;
  state: string;
}

export default async function DiscordRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/login', async (request, reply) => {
    if (request.user) {
      return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }

    const state = randomBytes(16).toString('base64');
    states.add(state);
    setTimeout(() => states.delete(state), 1000 * 60);

    return reply.redirect(
        encodeURL(OAuthURLS['authorize'], {
          scope: JSON.parse(process.env.DISCORD_OAUTH_SCOPES),
          prompt: 'consent',
          client_id: process.env.DISCORD_CLIENT_ID,
          redirect_uri: `${process.env.HOST}/discord/login/callback`,
          response_type: 'code',
          state: encodeURIComponent(state),
        })
    );
  });

  fastify.get<{ Querystring: loginCallbackQuery }>(
      '/login/callback',
      async (request, reply) => {
        const {
          user,
          query: {code, state},
        } = request;

        if (user) {
          return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }

        if (!code || !state || !states.has(decodeURIComponent(state))) {
          return reply.redirect(`${process.env.HOST}/discord/login`);
        }

        states.delete(state);

        try {
          const accessTokenData = await req(OAuthURLS['token'], 'POST', {
            body: paramBuilder({
              client_id: process.env.DISCORD_CLIENT_ID,
              client_secret: process.env.DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code,
              redirect_uri: `${process.env.HOST}/discord/login/callback`,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const userData = await req(
              'https://discord.com/api/v9/users/@me',
              'GET',
              {
                headers: {
                  Authorization: `Bearer ${accessTokenData.access_token}`,
                },
              }
          );

          const kythiUser = await prisma.user.findFirst({
            where: {discordId: userData.id},
          });

          if (!kythiUser) {
            return reply.code(400).redirect(`${process.env.FRONTEND_URL}`);
          }

          /* eslint-disable camelcase */
          const {
            id,
            username,
            avatar,
            discriminator,
            banner,
            banner_color,
            premium_type,
          } = userData;

          await prisma.discord.update({
            where: {id},
            data: {
              username,
              discriminator,
              tag: `${username}#${discriminator}`,
              avatar: getAvatarURL(id, parseInt(discriminator), avatar),
              banner,
              bannerColor:
              !banner && !banner_color ?
                rgbToHex(
                    ...(await getColor(
                        getAvatarURL(id, parseInt(discriminator), avatar)
                    ))
                ) :
                banner_color,
              nitroType:
              premium_type === 0 ?
                'NONE' :
                premium_type === 1 ?
                'CLASSIC' :
                'PREMIUM',
            },
          });
          /* eslint-enable camelcase */

          await request.logIn(
              await prisma.user.findFirst({where: {id: kythiUser.id}})
          );
          return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (err) {
          const errorData =
          typeof (err as AxiosError).response !== 'undefined' ?
            (err as AxiosError).response?.data :
            (err as Error).message;

          return reply.code(400).send({
            statusCode: 400,
            message:
            'An unexpected error has occurred. Your discord account was not linked.',
            error: errorData,
          });
        }
      }
  );
}

export const autoPrefix = '/auth/discord';

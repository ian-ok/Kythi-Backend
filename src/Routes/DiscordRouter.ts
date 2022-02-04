import {AxiosError} from 'axios';
import {getColor} from 'colorthief';
import {randomBytes} from 'node:crypto';
import type {FastifyInstance} from 'fastify';
import {OAuthURLS} from '../Utility/Constants';
import {getDiscordImage, rgbToHex, applyUserRoles} from '../Utility/Misc';
import {req, encodeURL, paramBuilder} from '../Utility/Requests';


const states = new Set<string>();
interface linkCallbackQuery {
  code: string;
  state: string;
}

export default async function DiscordRouter(fastify: FastifyInstance) {
  const {prisma} = fastify;

  fastify.get('/link', async (request, reply) => {
    if (!request.user || !request.user.verifiedAt || request.user.discordId) {
      return reply.redirect(encodeURL(`${process.env.FRONTEND_URL}/login`, {
        redirect: encodeURIComponent(`${process.env.HOST}/discord/link`),
      }));
    }

    const state = randomBytes(16).toString('base64');
    states.add(state);
    setTimeout(() => states.delete(state), 1000 * 60);

    return reply.redirect(
        encodeURL(OAuthURLS['authorize'], {
          scope: JSON.parse(process.env.DISCORD_OAUTH_SCOPES),
          prompt: 'consent',
          client_id: process.env.DISCORD_CLIENT_ID,
          redirect_uri: `${process.env.HOST}/discord/link/callback`,
          response_type: 'code',
          state: encodeURIComponent(state),
        })
    );
  });

  fastify.get<{ Querystring: linkCallbackQuery }>(
      '/link/callback',
      async (request, reply) => {
        const {
          user,
          query: {code, state},
        } = request;

        if (!user || user.discordId || !code) {
          return reply.redirect(process.env.FRONTEND_URL);
        }

        if (
          !state ||
          !states.has(decodeURIComponent(state))
        ) {
          return reply.redirect(`${process.env.HOST}/discord/link`);
        }

        states.delete(state);

        try {
          const accessTokenData = await req(OAuthURLS['token'], 'POST', {
            body: paramBuilder({
              client_id: process.env.DISCORD_CLIENT_ID,
              client_secret: process.env.DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code,
              redirect_uri: `${process.env.HOST}/discord/link/callback`,
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

          /* eslint-disable camelcase */
          const {
            id,
            username,
            avatar,
            discriminator,
            banner,
            banner_color,
          } = userData as { [key: string]: string };

          await prisma.discord.create({
            data: {
              id,
              username,
              discriminator,
              tag: `${username}#${discriminator}`,
              avatar: getDiscordImage({
                id,
                hash: avatar,
                discriminator: parseInt(discriminator),
              }),
              banner: banner ? getDiscordImage({
                id,
                hash: banner,
                isBanner: true,
              }) : null,
              bannerColor:
              !banner && !banner_color ?
                rgbToHex(
                    ...(await getColor(
                        getDiscordImage({
                          id,
                          hash: avatar,
                          discriminator: parseInt(discriminator),
                        })
                    ))
                ) :
                banner_color,
              nitroType:
              userData.premium_type === 0 ?
                'NONE' :
                userData.premium_type === 1 ?
                'CLASSIC' :
                'PREMIUM',
            },
          });
          await prisma.user.update({
            where: {id: user.id},
            data: {discordId: id},
          });
          /* eslint-enable camelcase */

          await applyUserRoles(id).catch(() => null);
          return reply.redirect(process.env.FRONTEND_URL);
        } catch (err) {
          const errorData = typeof (err as AxiosError).response !== 'undefined' ? (err as AxiosError).response?.data : (err as Error).message;

          return reply.code(400).send({statusCode: 400, message: 'An unexpected error has occurred. Your discord account was not linked.', error: errorData});
        }
      }
  );
}

export const autoPrefix = '/discord';

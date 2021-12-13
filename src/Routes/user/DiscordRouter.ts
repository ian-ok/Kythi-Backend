import type {FastifyInstance} from 'fastify';
import {User} from '../../Models/User';
import {OAuthURLS, identifyEndpoint, discordCDN} from '../../Utility/Constants';
import {request as axiosReq, encodeURL, paramBuilder, getAvatarURL, sendReply} from '../../Utility';

interface linkCallbackQuery {
  code: string;
}

/**
  The Router
  @param {FastifyInstance} fastify
*/
export default async function DiscordRouter(fastify: FastifyInstance) {
  fastify.get('/link', async (request, reply) => {
    if (!request.user) return reply.redirect(process.env.FRONTEND_URL);

    return reply.redirect(
        encodeURL(OAuthURLS['authorize'], {
          scope: JSON.parse(process.env.DISCORD_OAUTH_SCOPES),
          prompt: 'consent',
          client_id: process.env.DISCORD_CLIENT_ID,
          redirect_uri: `${process.env.HOST}discord/link/callback`,
          response_type: 'code',
        }),
    );
  });

  fastify.get<{Querystring: linkCallbackQuery}>(
      '/link/callback',
      async (request, reply) => {
        const {
          user,
          query: {code},
        } = request;

        if (!user || !code) return reply.redirect(process.env.FRONTEND_URL);

        try {
          const accessTokenData = await axiosReq(OAuthURLS['token'], 'POST', {
            body: paramBuilder({
              client_id: process.env.DISCORD_CLIENT_ID,
              client_secret: process.env.DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code,
              redirect_uri: `${process.env.HOST}discord/link/callback`,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const userData = await axiosReq(identifyEndpoint, 'GET', {
            headers: {
              'Authorization': `Bearer ${accessTokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

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

          user.discord = {
            id,
            username,
            tag: `${username}#${discriminator}`,
            discriminator: parseInt(discriminator),
            avatar: getAvatarURL(id, parseInt(discriminator), avatar),
            banner: banner ?
            `${discordCDN}banners/${id}/${banner}.${
                banner.startsWith('a_') ? 'gif' : 'png'
            }` :
            null,
            bannerColor: banner_color,
            nitroType:
            premium_type !== null ?
              premium_type === 1 ?
                'classic' :
                'nitro' :
              null,
          };
          /* eslint-enable camelcase */

          await user.save();

          return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (err) {
          return sendReply(
              reply,
              500,
              'There was a problem linking your account. If this error persists please contact support.',
          );
        }
      },
  );

  fastify.get('/login', async (request, reply) => {
    if (request.user) {
      return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }

    return reply.redirect(
        encodeURL(OAuthURLS['authorize'], {
          scope: JSON.parse(process.env.DISCORD_OAUTH_SCOPES),
          prompt: 'none',
          client_id: process.env.DISCORD_CLIENT_ID,
          redirect_uri: `${process.env.HOST}discord/login/callback`,
          response_type: 'code',
        }),
    );
  });

  fastify.get<{Querystring: linkCallbackQuery}>(
      '/login/callback',
      async (request, reply) => {
        if (request.user) {
          return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }

        try {
          const accessTokenData = await axiosReq(OAuthURLS['token'], 'POST', {
            body: paramBuilder({
              client_id: process.env.DISCORD_CLIENT_ID,
              client_secret: process.env.DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code: request.query.code,
              redirect_uri: `${process.env.HOST}discord/link/callback`,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const userData = await axiosReq(identifyEndpoint, 'GET', {
            headers: {
              'Authorization': `Bearer ${accessTokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          const user: User = await User.findOne({'discord.id': userData.id});

          if (!user) {
            return sendReply(reply, 404, 'Unknown User');
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

          user.discord = {
            id,
            username,
            tag: `${username}#${discriminator}`,
            discriminator: parseInt(discriminator),
            avatar: getAvatarURL(id, parseInt(discriminator), avatar),
            banner: banner ?
            `${discordCDN}banners/${id}/${banner}.${
                banner.startsWith('a_') ? 'gif' : 'png'
            }` :
            null,
            bannerColor: banner_color,
            nitroType:
            premium_type !== null ?
              premium_type === 1 ?
                'classic' :
                'nitro' :
              null,
          };
          /* eslint-enable camelcase */

          await user.save();

          await request.logIn(user);

          return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (err) {
          return sendReply(
              reply,
              500,
              'There was a problem logging in. If this error persists please contact support.',
          );
        }
      },
  );
}

export const autoPrefix = '/discord';

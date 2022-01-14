import {req} from './Requests';
import {APIMessage} from 'discord-api-types';
import {discordApiUrl, discordCdnUrl} from './Constants';


interface ImageOptions {
  id: string;
  hash: string;
  isBanner?: boolean;
  discriminator?: number;
}

export function getDiscordMessage(
    channelId: string,
    messageId: string
): Promise<APIMessage> {
  return new Promise((resolve, reject) => {
    req(`${discordApiUrl}/channels/${channelId}/messages/${messageId}`, 'GET', {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }).then(resolve).catch(reject);
  });
}

export async function sendDiscordMessage(
    channelId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any
): Promise<APIMessage> {
  return new Promise((resolve, reject) => {
    req(`${discordApiUrl}/channels/${channelId}/messages`, 'POST', {
      body: message,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }).then(resolve).catch(reject);
  });
}

export async function editDiscordMessage(
    channelId: string,
    messageId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edited: any
): Promise<APIMessage> {
  return new Promise((resolve, reject) => {
    req(`${discordApiUrl}/channels/${channelId}/messages/${messageId}`, 'PATCH', {
      body: edited,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }).then(resolve).catch(reject);
  });
}

export function deleteDiscordMessage(
    channelId: string,
    messageId: string,
    reason?: string
): Promise<APIMessage> {
  return new Promise((resolve, reject) => {
    req(`${discordApiUrl}/channels/${channelId}/messages/${messageId}`, 'DELETE', {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'X-Audit-Log-Reason': reason ? reason : 'No reason provided',
      },
    }).then(resolve).catch(reject);
  });
}

export function getDiscordImage({
  id,
  hash,
  isBanner = false,
  discriminator,
}: ImageOptions) {
  if (!hash && discriminator && !isBanner) {
    return `${discordCdnUrl}/embed/avatars/${discriminator % 5}.png`;
  }

  return `${discordCdnUrl}/${isBanner ? 'banners' : 'avatars'}/${id}/${hash}.${
    hash.startsWith('a_') ? 'gif' : 'png'
  }`;
}

export const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');

export const generateRandomString = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

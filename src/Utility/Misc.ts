import {discordCdnUrl} from './Constants';

interface ImageOptions {
  id: string;
  hash: string;
  isBanner?: boolean;
  discriminator?: number;
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

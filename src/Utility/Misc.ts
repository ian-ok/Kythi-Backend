import {discordCdnUrl} from './Constants';

export function getAvatarURL(id: string, discriminator: number, hash: string) {
  if (!hash) {
    return `${discordCdnUrl}/embed/avatars/${discriminator % 5}.png`;
  }

  return `${discordCdnUrl}/avatars/${id}/${hash}.${
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

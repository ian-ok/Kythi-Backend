import {FastifyReply} from 'fastify';
import {discordCDN, errorCodes} from './Constants';
import axios, {Method, AxiosRequestHeaders} from 'axios';

interface requestParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: AxiosRequestHeaders;
}

/**
 * Wrapper for making requests
 * @param {string} url The url to send the request to
 * @param {Method} method The method to use for the request
 * @param {requestParams} params The parameters to send with the request
 * @return {Promise<any>} Axios Response
 */
export function request(
    url: string,
    method: Method,
    {body, headers}: requestParams = {
      body: {},
      headers: {
        'Content-Type': 'application/json',
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url,
      headers,
      data: body,
    })
        .then((data) => {
          resolve(data.data);
        })
        .catch((error) => {
          reject(error);
        });
  });
}

/**
 * Generates a random string
 * @param {number} length The length of the string returned
 * @return {string} The string generated
 */
export function generateRandomString(length: number): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 A function to streamline responses
  @param {FastifyReply} reply The reply object
  @param {number} statusCode The status code to send
  @param {message} message message to send
  @param {any[]} additonalData Any additional data to send
  @return {FastifyReply} The reply object
*/
export function sendReply(
    reply: FastifyReply,
    statusCode: number,
    message: string | null,
    additonalData?: object,
): FastifyReply {
  return reply.code(statusCode).send(
    errorCodes[statusCode as keyof typeof errorCodes] ?
      {
        statusCode,
        error: errorCodes[statusCode as keyof typeof errorCodes],
        message,
        ...additonalData,
      } :
      {
        statusCode,
        message,
        ...additonalData,
      },
  );
}

/**
 * A function to encode uri components
 * @param {string} url The url to append
 * @param {object} data The data to encode
 * @return {string} The encoded url
 */
export function encodeURL(url: string, data: object): string {
  return (
    url +
    '?' +
    Object.keys(data)
        .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                  data[key as keyof typeof data],
              )}`,
        )
        .join('&')
  );
}

/**
 * A function to prettify url search paramaters
 * @param {object} data The data to encode
 * @return {URLSearchParams} The search paramaters
 */
export function paramBuilder(data: object): URLSearchParams {
  const params = new URLSearchParams();

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      params.append(key, data[key as keyof typeof data]);
    }
  }

  return params;
}

/**
 * A function to get a discord avatar url
 * @param {string} id The users id
 * @param {number} discriminator The users discriminator
 * @param {string} hash The url to the users avatar
 * @return {string} The users avatar url
 */
export function getAvatarURL(
    id: string,
    discriminator: number,
    hash: string,
): string {
  if (!hash) {
    return `${discordCDN}/embed/avatars/${discriminator % 5}.png`;
  }

  return `${discordCDN}/avatars/${id}/${hash}.${
    hash.startsWith('a_') ? 'gif' : 'png'
  }`;
}

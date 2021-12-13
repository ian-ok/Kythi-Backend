export const allowedMails = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
];

export const errorCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
};

export const OAuthURLS = {
  'authorize': 'https://discord.com/api/v9/oauth2/authorize',
  'token': 'https://discord.com/api/v9/oauth2/token',
  'revoke': 'https://discord.com/api/v9/oauth2/token/revoke',
};

export const discordCDN = 'https://cdn.discordapp.com';

export const identifyEndpoint = 'https://discord.com/api/v9/users/@me';

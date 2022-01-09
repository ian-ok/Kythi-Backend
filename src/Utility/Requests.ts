import axios, {Method, AxiosRequestHeaders} from 'axios';

interface requestParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: AxiosRequestHeaders;
}

export function req(
    url: string,
    method: Method,
    {body, headers}: requestParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      data: body,
    }).then((data) => {
      resolve(data.data);
    }).catch((error) => {
      reject(error);
    });
  });
}

export function paramBuilder(data: object): URLSearchParams {
  const params = new URLSearchParams();

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      params.append(key, data[key as keyof typeof data]);
    }
  }

  return params;
}

export function encodeURL(url: string, data: object): string {
  return (
    url +
    '?' +
    Object.keys(data)
        .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                  data[key as keyof typeof data]
              )}`
        )
        .join('&')
  );
}

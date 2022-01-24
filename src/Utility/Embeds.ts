import {File} from '@prisma/client';

/**
 * A function to replace all markers with their values (this is extremely unreadable im sorry)
 * @param {Embed} embed The embed to replace the markers in
 * @param {File} fileModel The file model for data
 * @param {User} user The user model for data
 * @return {Embed} The formatted embed
 */
export function formatEmbed(
    embed: object,
    fileModel: File,
    user: PassportUser
): object {
  for (const prop of ['authorText', 'siteText', 'color', 'title', 'description']) {
    const value = embed[prop as keyof object];

    if (value) {
      if (prop === 'color' && (value as string).toLowerCase() === 'random') {
        (embed[prop as keyof object] as string) = `#${Math.floor(
            Math.random() * 0xffffff
        ).toString(16)}`;
        continue;
      }

      (embed[prop as keyof object] as string) = formatEmbedString(
          value,
          fileModel,
          user
      );
    }
  }

  return embed;
}

/**
 * A function to replace all markers with their values
 * @param {string} str The string to replace the markers in
 * @param {File} fileModel The file model for data
 * @param {User} user The user model for data
 * @return {string} The formatted string
 */
function formatEmbedString(
    str: string,
    fileModel: File,
    user: PassportUser
): string {
  str = str
      .replaceAll(/:username:/gi, user.username)
      .replaceAll(/:filename:/gi, fileModel.fileName)
      .replaceAll(/:uploadcount:/gi, user.upload.count.toString())
      .replaceAll(/:filesize:/gi, formatBytes(fileModel.size))
      .replaceAll(/:date:/gi, fileModel.uploadedAt.toLocaleDateString())
      .replaceAll(/:time:/gi, fileModel.uploadedAt.toLocaleTimeString())
      .replaceAll(/:timestamp:/gi, fileModel.uploadedAt.toLocaleString());

  let data = str.match(/:(time|timestamp|date)-([^}]+):/i);

  while (data && data.length >= 3) {
    const [match, type, timeZone] = data;

    if (type === 'time') {
      str = str.replace(
          match,
          new Date().toLocaleTimeString('en-US', {timeZone})
      );
    } else if (type === 'timestamp') {
      str = str.replace(
          match,
          new Date().toLocaleString('en-US', {timeZone})
      );
    } else if (type === 'date') {
      str = str.replace(
          match,
          new Date().toLocaleDateString('en-US', {timeZone})
      );
    }

    data = str.match(/:(time|timestamp|date)-([^}]+):/i);
  }

  return str;
}

/**
 * A function that converts bytes to a human readable format
 * @param {number} bytes The amount of bytes
 * @return {string} The formatted bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

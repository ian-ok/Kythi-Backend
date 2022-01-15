import {S3} from 'aws-sdk';
import {File} from '@prisma/client';

export const s3Info = JSON.parse(process.env.S3_INFO);
export const s3 = new S3({
  ...s3Info,
  signatureVersion: 'v4',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadFile(file: File, buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: `${file.uploaderId}/${file.cdnName}`,
      Body: buffer,
      ACL: 'public-read',
      ContentType: file.mimeType,
    }, (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
}

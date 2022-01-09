import {join} from 'path';
import {compile} from 'handlebars';
import {readFile} from 'fs/promises';
import {createTransport} from 'nodemailer';

const mailInfo = JSON.parse(process.env.MAIL_INFO);
const transporter = createTransport(mailInfo);

export async function verifyMail(user: User) {
  const html = await readFile(join(__dirname, 'Templates', 'Verification.html'), 'utf8');
  const compiledHtml = compile(html)({
    username: user.username,
    email: user.email,
    host: process.env.HOST,
    verificationCode: user.verificationCode,
  });

  transporter.sendMail({
    from: mailInfo.auth.user,
    to: user.email,
    subject: 'Verify your email',
    html: compiledHtml,
  });
}

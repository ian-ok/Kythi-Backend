import mailer from 'nodemailer';
import {User} from '../Models/User';

const mailInfo = JSON.parse(process.env.MAIL_INFO);
const transporter = mailer.createTransport(mailInfo);

/**
  Sends an email to the user with a verification link.
  @param {User} user The user to send the email to.
  @return {boolean | Promise<mailer.SentMessageInfo>} The result
*/
export function sendVerifyMail(
    user: User,
): boolean | Promise<mailer.SentMessageInfo> {
  if (
    !user.verificationCode ||
    user.verified ||
    user.verifiedAt !== null ||
    !user.email
  ) {
    return false;
  }

  const mailOptions = {
    from: mailInfo.auth.user,
    to: user.email,
    subject: 'Verify your email',
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </head>
      
        <body style="padding: 3%; margin: 0; color: white; background: #2e3440">
          <div
            style="color: #eceff4; padding: 20px; margin: 0 auto; max-width: 450px"
          >
            <header style="text-align: center">
              <img
                src="https://nyc3.digitaloceanspaces.com/kythi.pics/60089edb-a3ac-51d5-953b-feaf7fa84057/FEwZsQiO7j.png"
                width="50"
                alt=""
                srcset=""
                style="display: block; margin: auto"
              />
              <h1>Verification</h1>
            </header>
            Hey ${user.username}!
            <p style="display: block; margin: 2em 0 2em; font-weight: 300">
              To complete your Kythi registration, we just need you to verify your
              email address
              <a href="mailto:${user.email}" style="color: #5e81ac">${user.email}</a>
              by clicking the button below.
            </p>
            <a
              style="
                display: block;
                background: #3b4252;
                box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
                padding: 1em 3em;
                margin: 1em 0 1em;
                text-align: center;
                color: white;
                text-decoration: none;
                border-radius: 7px;
              "
              href="${process.env.HOST}verify/${user.verificationCode}"
              data-saferedirecturl="https://www.google.com/url?q=${process.env.HOST}verify/${user.verificationCode}"
              >Verify Email</a
            >
            <p style="font-size: 0.9em; color: rgba(255, 255, 255, 0.5)">
              Button not working? Paste the following link into your browser:
              <a
                href="${process.env.HOST}verify/${user.verificationCode}"
                data-saferedirecturl="https://www.google.com/url?q=${process.env.HOST}verify/${user.verificationCode}"
                style="color: #5e81ac"
                >${process.env.HOST}verify/${user.verificationCode}</a
              >
            </p>
            <p style="display: block; margin: 2em 0 2em; font-weight: 300">
              Thanks, <br />The Developer Team at Kythi ❤️
            </p>
            <p
              style="
                text-align: center;
                display: block;
                margin: auto;
                bottom: 10px;
                font-size: 0.8em;
                color: rgba(255, 255, 255, 0.5);
              "
            >
              You're receiving this email because you recently created a Kythi
              account. If this wasnt you, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

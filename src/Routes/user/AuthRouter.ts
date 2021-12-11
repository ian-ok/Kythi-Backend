import Joi from 'joi';
import {v5} from 'uuid';
import {hash} from 'argon2';
import {User} from '../../Models/User';
import {sendReply} from '../../Utility';
import passport from 'fastify-passport';
import {Invite} from '../../Models/Invite';
import type {FastifyInstance} from 'fastify';
import {sendVerifyMail} from '../../Utility/Mail';
import {generateRandomString} from '../../Utility';
import {allowedMails} from '../../Utility/Constants';

interface registerBody {
  username: string;
  email: string;
  password: string;
  inviteCode: string;
}

/**
  The Router
  @param {FastifyInstance} fastify
*/
export default async function AuthRouter(fastify: FastifyInstance) {
  fastify.post<{ Body: registerBody }>(
      '/register',
      {
        schema: {
          body: Joi.object().keys({
            username: Joi.string()
                .required()
                .min(4)
                .max(24)
                .pattern(/^[a-zA-Z0-9_]+$/),
            email: Joi.string().required().email().lowercase(),
            password: Joi.string().min(10).max(100).required(),
            inviteCode: Joi.string().required(),
          }),
        },
      },
      async (request, reply) => {
        const {username, email, password, inviteCode} = request.body;
        const inviteUsed: Invite = await Invite.findById(inviteCode);
        const inviter: User = await User.findById(inviteUsed?.createdBy);

        if (!inviteUsed || !inviter) {
          return sendReply(reply, 400, 'Invalid invite code');
        }

        if (!allowedMails.includes(email.split('@')[1])) {
          return sendReply(reply, 400, 'Your email domain is unsupported. Try again with another email.');
        }

        if (
          await User.findOne({
            $or: [
              {username: new RegExp(`^${username}$`, 'i')},
              {email: new RegExp(`^${email}$`, 'i')},
            ],
          })
        ) {
          return sendReply(reply, 400, 'The username or email is taken');
        }

        const user = new User();
        user._id = v5(username, v5.DNS);
        user.username = username;
        user.email = email;
        user.password = await hash(password);
        user.invite.invitedBy = inviter._id;
        user.verificationCode = generateRandomString(32);
        sendVerifyMail(user);
        await user.save();

        inviter.invite.invited.push(user._id);
        await inviteUsed.remove();
        await inviter.save();

        return sendReply(reply, 200, 'Successfully registered! Check your email for your verfication link.');
      }
  );

  fastify.get('/session', async (request, reply) => {
    if (request.user) {
      if (!request.user.verified || !request.user.verifiedAt) {
        return sendReply(reply, 400, 'Verify your email and try again');
      }

      return sendReply(reply, 200, null, {user: request.user});
    }

    return sendReply(reply, 400, null, {user: null});
  });

  fastify.post(
      '/login',
      {
        schema: {
          body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required(),
          }),
        },
        preHandler: passport.authenticate('local'),
      },
      async (request, reply) => {
        const user = request.user as User;

        if (!user.verified || !user.verifiedAt) {
          return sendReply(reply, 400, 'Verify your email and try again');
        }

        return sendReply(reply, 200, 'Successfully logged in', {user});
      }
  );
}

export const autoPrefix = '/auth';

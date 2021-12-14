import {generateRandomString} from '../Utility';
import {Document, Schema, model, models} from 'mongoose';

export interface User extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  verifiedAt: Date;
  verified: boolean;
  verificationCode?: string;
  upload: {
    count: number;
    key: string;
    settings: {
      embeds: [];
    };
  };
  invite: {
    count: number;
    invited: string[];
    invitedBy: string;
  };
  discord: {
    id: string | null;
    username: string | null;
    tag: string | null;
    discriminator: string | null;
    avatar: string | null;
    banner: string | null;
    bannerColor: string | null;
    nitroType: 'classic' | 'nitro' | null;
  };
}

const UserSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    required: false,
  },
  upload: {
    count: {
      type: Number,
      default: 0,
    },
    key: {
      type: String,
      default: generateRandomString(16),
    },
    settings: {
      embeds: {
        type: [
          {
            color: String,
            title: String,
            description: String,
            author: {
              text: String,
              url: String,
            },
            site: {
              text: String,
              url: String,
            },
          },
        ],
        default: [
          {
            color: 'RANDOM',
            title: ':filename:',
            description: 'Image uploaded on Kythi.com at :date:',
            author: {
              text: ':username:',
              url: '',
            },
            site: {
              text: 'Kythi.com',
              url: 'https://kythi.com/',
            },
          },
        ],
      },
    },
  },
  invite: {
    count: {
      type: Number,
      default: 0,
    },
    invited: {
      type: [String],
      default: [],
    },
    invitedBy: {
      type: String,
      required: true,
    },
  },
  discord: {
    id: {
      type: String,
      unique: true,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      default: null,
    },
    tag: {
      type: String,
      unique: true,
      default: null,
    },
    discriminator: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      unique: true,
      default: null,
    },
    banner: {
      type: String,
      unique: true,
      default: null,
    },
    bannerColor: {
      type: String,
      default: null,
    },
    nitroType: {
      type: String,
      default: null,
    },
  },
});

export const User = models['users'] || model<User>('users', UserSchema);

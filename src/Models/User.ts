import { generateRandomString } from "../Utility";
import { Document, Schema, model, models } from "mongoose";

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
    }
  }
  invite: {
    count: number;
    invited: string[];
    invitedBy: string;
  }
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
        // ! This is incorrectly typed, everything here is not required, but im waiting until cdn is setup for further testing :>
        type: [{
          color: {
            type: String,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          author: {
            text: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          },
          site: {
            text: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          }
        }],
        default: [{
          color: "RANDOM",
          title: "This is a title",
          description: "This is a description",
          author: {
            text: "This is the author",
            url: "https://google.com",
          },
          site: {
            text: "This is the site",
            url: "https://google.com",
          },
        }],
      }
    }
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
      required: true
    }
  }
});

export const User = models["users"] || model<User>("users", UserSchema);

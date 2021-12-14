import {Document, Schema, model, models} from 'mongoose';

export interface File extends Document {
  _id: string;
  cdnName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
  uploader: {
    _id: string;
    username: string;
  };
  embed: Embed;
}

const FileSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  cdnName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploader: {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  embed: {
    type: {
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
    required: true,
  },
});

export const File = models['files'] || model<File>('files', FileSchema);

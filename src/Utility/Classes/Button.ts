/* eslint-disable camelcase */

const ButtonStyles = {
  'PRIMARY': 1,
  'SECONDARY': 2,
  'SUCCESS': 3,
  'DANGER': 4,
  'LINK': 5,
};

interface EmojiPartial {
  name: string;
  id: string;
  animated: boolean;
}

export default class Button {
  label: string | null = null;
  emoji: EmojiPartial | null = null;
  style: number | null = 1;
  custom_id: string | null = null;
  url: string | null = null;
  disabled: boolean | null = null;

  constructor(data?: Button) {
    Object.assign(this, data);
  }

  setLabel(label: string): this {
    this.label = label;
    return this;
  }

  setEmoji({name, id, animated}: EmojiPartial): this {
    this.emoji = {name, id, animated};
    return this;
  }

  setStyle(style: 1 | 2 | 3 | 4 | 5 | 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK'): this {
    if (typeof style === 'string' && !(style in ButtonStyles)) throw new Error(`Invalid button style: ${style}`);

    this.style = typeof style === 'string' ? ButtonStyles[style as keyof typeof ButtonStyles] : style;
    return this;
  }

  setCustomId(custom_id: string): this {
    this.custom_id = custom_id;
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  toJSON() {
    return {
      type: 2,
      label: this.label,
      emoji: this.emoji,
      style: this.style,
      custom_id: this.custom_id,
      url: this.url,
      disabled: this.disabled,
    };
  }
}

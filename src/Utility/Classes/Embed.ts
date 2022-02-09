/* eslint-disable camelcase */

interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export default class Embed {
  public author: EmbedAuthor | null = null;
  public description: string | null = null;
  public color: number | null = null;
  public timestamp: string | null = null;
  public footer: EmbedFooter | null = null;

  constructor(data?: Embed) {
    Object.assign(this, data);
  }

  setAuthor({name, url, icon_url}: EmbedAuthor): this {
    this.author = {name, url, icon_url};
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setColor(color: number): this {
    this.color = color;
    return this;
  }

  setFooter({text, icon_url}: EmbedFooter): this {
    this.footer = {text, icon_url};
    return this;
  }

  setTimestamp(timestamp: Date | number = new Date) {
    if (typeof timestamp === 'number') timestamp = new Date(timestamp);
    this.timestamp = timestamp.toISOString();
    return this;
  }

  toJSON() {
    return {
      author: this.author,
      description: this.description,
      color: this.color,
      timestamp: this.timestamp,
      footer: this.footer,
    };
  }
}

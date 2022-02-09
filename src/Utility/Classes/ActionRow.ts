import Button from './Button';

type ActionRowComponent =
  | Button
  | {
      type: number;
      label: string | null;
      emoji: {
        name: string;
        id: string;
        animated: boolean;
      } | null;
      style: number | null;
      custom_id: string | null;
      url: string | null;
      disabled?: boolean | null;
    };

export default class ActionRow {
  components: ActionRowComponent[] = [];

  constructor(data?: ActionRow) {
    Object.assign(this, data);
  }

  addComponent(component: ActionRowComponent): this {
    if (component instanceof Button) this.components.push(component.toJSON());
    return this;
  }

  toJSON() {
    return {type: 1, components: this.components};
  }
}

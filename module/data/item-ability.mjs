import RailersItemBase from './base-item.mjs';

export default class RailersAbility extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Ability',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.action = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'headgear',
      choices: Object.keys(CONFIG.RAILERS.actionTypeOptions)
    });
  }
}
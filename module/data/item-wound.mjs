import RailersItemBase from './base-item.mjs';

export default class RailersWound extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Wound',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.severity = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
    });

    schema.damage = new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 1,
        min: 0,
      });

    return schema;
  }
}
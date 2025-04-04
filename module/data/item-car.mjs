import RailersItemBase from './base-item.mjs';

export default class RailersCar extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Car',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.power = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    schema.weight = new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 1,
        min: 0,
    });

    return schema;
  }
}
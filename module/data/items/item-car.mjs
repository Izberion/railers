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
      initial: 0,
      min: 0,
    });

    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
    });

    schema.capacity = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.armor = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.capacityType = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: "none",
      choices: Object.keys(CONFIG.RAILERS.capacityTypeOptions)
    });

    return schema;
  }
}
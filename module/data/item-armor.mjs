import RailersItemBase from './base-item.mjs';

export default class RailersArmor extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.layer = new fields.NumberField({
      required: false,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
    });

    schema.protection = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    schema.insulation = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    schema.load = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    schema.quantity = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
    });


    return schema;
  }
}
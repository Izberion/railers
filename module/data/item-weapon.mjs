import RailersItemBase from './base-item.mjs';

export default class RailersWeapon extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.ammo = new fields.NumberField({
      required: false,
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

    schema.severity = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    schema.range = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
    });

    return schema;
  }
}
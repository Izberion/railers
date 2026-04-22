import RailersItemBase from './base-item.mjs';

export default class RailersLocomotive extends RailersItemBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Item.base', 'RAILERS.Item.Locomotive'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.powerCapacity = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    schema.weightLimit = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    schema.fuelCapacity = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    return schema;
  }
}
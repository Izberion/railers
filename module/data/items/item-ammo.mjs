import RailersItemBase from './base-item.mjs';

export default class RailersAmmo extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Ammo'
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.ammoType = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'handgun'
    });

    schema.roundsRemaining = new fields.NumberField({
      ...requiredInteger,
      initial: 50,
      min: 0
    });

    return schema;
  }

  get localizedAmmoType() {
    if (!this.ammoType) return '';
    const key = CONFIG.RAILERS.ammoTypes[this.ammoType] || this.ammoType;
    return game.i18n.localize(key);
  }

  get roundsPerBox() {
    return CONFIG.RAILERS.ammoCapacity[this.ammoType] ?? 0;
  }

  get totalRounds() {
    return (this.quantity * this.roundsPerBox) - (this.roundsPerBox - this.roundsRemaining);
  }
}
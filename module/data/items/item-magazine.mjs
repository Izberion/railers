import RailersItemBase from './base-item.mjs';

export default class RailersMagazine extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Magazine'
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.magType = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'box'
    });

    schema.ammoType = new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    });

    schema.loadedInWeapon = new fields.StringField({ 
      nullable: true, 
      initial: null 
    });

    schema.ammo = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0
      })
    });

    return schema;
  }

  get isEmpty() {
    return this.ammo.value === 0 || this.ammoType === null;
  }

  get isLoaded() {
    return this.loaded && !this.isEmpty;
  }

  get localizedMagType() {
    if (!this.magType) return '';
    const key = CONFIG.RAILERS.magTypes[this.magType] || this.magType;
    return game.i18n.localize(key);
  }

  get localizedAmmoType() {
    if (!this.ammoType) return game.i18n.localize('RAILERS.Item.Magazine.FIELDS.empty');
    const key = CONFIG.RAILERS.ammoTypes[this.ammoType] || this.ammoType;
    return game.i18n.localize(key);
  }
}
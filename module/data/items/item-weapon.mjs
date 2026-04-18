import RailersItemBase from './base-item.mjs';

export default class RailersWeapon extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.magazine = new fields.SchemaField({
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0
      }),
      max: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0
      })
    });

    schema.damage = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0
    });

    schema.severity = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0
    });

    schema.range = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'melee',
    });

    schema.attribute = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'combat',
    });

    schema.skill = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'melee',
    });

    schema.attack = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'major',
    });

    schema.reload = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'na',
    });

    schema.magType = new fields.StringField({
      required: false,
      nullable: true,
      blank: true,
      initial: null
    });

    schema.ammoType = new fields.StringField({
      required: false,
      nullable: true,
      blank: true,
      initial: null
    });

    schema.isConsumable = new fields.BooleanField({ 
      initial: false 
    });

    schema.loadedMagId = new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    });

    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0
      }),
      targetNumber: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 5,
        min: 4,
        max: 8
      }),
      diceBonus: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0
      }),
      modifiers: new fields.SchemaField({
        diceMod: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        }),
        tnMod: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        })
      }, { nullable: true, initial: null }),
      skipDialog: new fields.BooleanField({
        required: false,
        initial: false
      })
    });

    return schema;
  }

  prepareDerivedData() {
    const skill = this.skill;
    if (skill === "exertion") {
      this.attribute = "prowess";
    } else {
      this.attribute = "combat";
    }
  }

  get localizedAttackAction() {
    if (!this.attack) return "";
    const key = CONFIG.RAILERS.actionTypeOptions[this.attack] || this.attack;
    return game.i18n.localize(key);
  }

  get localizedReloadAction() {
    if (!this.reload) return "";
    const key = CONFIG.RAILERS.actionTypeOptions[this.reload] || this.reload;
    return game.i18n.localize(key);
  }

  get localizedRange() {
    if (!this.range) return "";
    const key = CONFIG.RAILERS.rangeOptions[this.range] || this.range;
    return game.i18n.localize(key);
  }

}
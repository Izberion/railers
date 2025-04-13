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
      choices: Object.keys(CONFIG.RAILERS.rangeOptions)
    });

    schema.attribute = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'combat',
      choices: Object.keys(CONFIG.RAILERS.attributes.character)
    });

    schema.skill = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'melee',
      choices: Object.keys(CONFIG.RAILERS.weaponSkillOptions)
    });

    schema.attack = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'major',
      choices: Object.keys(CONFIG.RAILERS.actionTypeOptions)
    })

    schema.reload = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'na',
      choices: Object.keys(CONFIG.RAILERS.actionTypeOptions)
    })

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

    schema.formula = new fields.StringField({
      required: false,
      blank: true,
      initial: ""
    });

    return schema;
  }

  get localizedAction() {
    if (!this.action) return "";
    const key = CONFIG.RAILERS.actionTypeOptions[this.action] || this.action;
    return game.i18n.localize(key);
  }

  get localizedAction() {
    if (!this.action) return "";
    const key = CONFIG.RAILERS.actionTypeOptions[this.action] || this.action;
    return game.i18n.localize(key);
  }

  get localizedRange() {
    if (!this.range) return "";
    const key = CONFIG.RAILERS.rangeOptions[this.range] || this.range;
    return game.i18n.localize(key);
  }

}
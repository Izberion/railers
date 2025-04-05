import RailersItemBase from './base-item.mjs';

export default class RailersWeapon extends RailersItemBase {
  static LOCALIZATION_PREFIXES = [
    'RAILERS.Item.base',
    'RAILERS.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.ammo = new fields.SchemaField({
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
      choices: Object.keys(RAILERS.rangeOptions)
    });

    schema.attribute = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'combat',
      choices: Object.keys(RAILERS.attributes.character)
    });

    schema.skill = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'melee',
      choices: Object.keys(RAILERS.weaponSkillOptions)
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

    schema.formula = new fields.StringField({
      required: false,
      blank: true,
      initial: ""
    });

    return schema;
  }

  async rollAttack() {
    const actor = this.actor;
    if (!actor) throw new Error("No actor available for weapon attack roll");

    const attributeValue = actor.system.attributes[this.attribute]?.value || 0;
    const skillValue = actor.system.attributes[this.attribute]?.skills?.[this.skill]?.value || 0;
    const baseDice = attributeValue + skillValue;

    const rollData = await RailerRollDialog.createAttackRoll(actor, this, baseDice);
    if (!rollData) return; 

    const { diceMod, tnMod, skipDialog } = rollData;
    const diceNum = baseDice;
    const diceBonus = this.roll.diceBonus || 0;
    const totalDice = Math.max(0, diceNum + diceBonus + (diceMod || 0));
    const tn = Math.max(1, Math.min(8, this.roll.targetNumber + (tnMod || 0)));
    const formula = `${totalDice}d8!>=${tn}`;

    await this.update({
      'roll.diceNum': diceNum,
      'roll.modifiers.diceMod': diceMod,
      'roll.modifiers.tnMod': tnMod,
      'roll.skipDialog': skipDialog,
      formula
    });

    const roll = new Roll(formula);
    await roll.evaluate({ async: true });

    const hits = roll.terms[0].results.reduce((count, result) => {
      return count + (result.result >= tn ? 1 : 0);
    }, 0);

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${this.name} Attack: ${formula} (${hits} hits)`
    });

    return { roll, hits };
  }

  async _quickRoll(diceMod, tnMod) {
    const actor = this.actor;
    if (!actor) throw new Error("No actor available for quick roll");

    const attributeValue = actor.system.attributes[this.attribute]?.value || 0;
    const skillValue = actor.system.attributes[this.attribute]?.skills?.[this.skill]?.value || 0;
    const diceNum = attributeValue + skillValue;
    const diceBonus = this.roll.diceBonus || 0;
    const totalDice = Math.max(0, diceNum + diceBonus + (diceMod || 0));
    const tn = Math.max(1, Math.min(8, this.roll.targetNumber + (tnMod || 0)));
    const formula = `${totalDice}d8!>=${tn}`;

    await this.update({ 'roll.diceNum': diceNum, formula });

    const roll = new Roll(formula);
    await roll.evaluate({ async: true });

    const hits = roll.terms[0].results.reduce((count, result) => {
      return count + (result.result >= tn ? 1 : 0);
    }, 0);

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${this.name} Attack: ${formula} (${hits} hits)`
    });

    return { roll, hits };
  }
}
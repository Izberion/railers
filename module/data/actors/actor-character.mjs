import RailersActorBase from './base-actor.mjs';

export default class RailersCharacter extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.Character'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.xp = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.attributes.character).reduce((obj, attr) => {
        obj[attr] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0 
          }),
          skills: new fields.SchemaField(
            // Nested skills under this attribute
            Object.keys(CONFIG.RAILERS.skills[attr] || {}).reduce((skillObj, skill) => {
              skillObj[skill] = new fields.SchemaField({
                value: new fields.NumberField({
                  ...requiredInteger,
                  initial: 0,
                  min: 0
                })
              });
              return skillObj;
            }, {})
          )
        });
        return obj;
      }, {})
    );

    schema.therms = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    for (const attrKey in this.attributes) {
      const attr = this.attributes[attrKey];
      if (attr.value <= 1) attr.mod = 0;
      else if (attr.value <= 8) attr.mod = 1;
      else if (attr.value <= 16) attr.mod = 2;
      else if (attr.value <= 24) attr.mod = 3;
      else attr.mod = 4;
    }

    let totalOnHandLoad = 0;
    let totalStowedLoad = 0;
    for (let item of this.parent.items) {
      let totalItemLoad = item.system.load * item.system.quantity;
      if (item.system.stowage === 'onHand') {
        totalOnHandLoad += totalItemLoad;
      } else if (item.system.stowage === 'stowed') {
        totalStowedLoad += totalItemLoad;
      }
    }
    this.load.onHand.value = totalOnHandLoad;
    this.load.stowed.value = totalStowedLoad;

    const baseLoad = 5 + this.attributes.prowess.mod + this.attributes.prowess.skills.exertion.value;

    // Allow load max to be overridden by items or effects
    if (this.load.onHand.max == null) {
      this.load.onHand.max = baseLoad;
    }

    let totalInsulation = 0;
    let totalProtection = 0;
    for (let item of this.parent.items) {
      if (item.type === 'clothing' && item.system.equipped === true) {
        totalInsulation += item.system.insulation;
        totalProtection += item.system.protection;
      }
    }
    this.defensePool = totalProtection + this.attributes.combat.mod;
    this.thermalThreshold = -1 * totalInsulation;

    this.wounds.max = 6 + this.attributes.fortitude.mod + this.attributes.fortitude.skills.endurance.value;




    this.initiativePool = this.attributes.intuition.mod + this.attributes.prowess.skills.athletics.value + this.initiativeMod ?? 0;
    if (!this.initiativeGroup) this.initiativeGroup = "PCs";
  }

}
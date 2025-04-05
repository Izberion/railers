import RailersActorBase from './base-actor.mjs';

export default class RailersCharacter extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.Character'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Dynamic attributes (e.g., combat, education, prowess) with nested skills
    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.attributes.character).reduce((obj, attr) => {
        obj[attr] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0 // Adjust max based on your system
          }),
          skills: new fields.SchemaField(
            // Nested skills under this attribute
            Object.keys(CONFIG.RAILERS.skills[attr] || {}).reduce((skillObj, skill) => {
              skillObj[skill] = new fields.SchemaField({
                value: new fields.NumberField({
                  ...requiredInteger,
                  initial: 0,
                  min: 0,
                  max: 5 // Adjust max as needed
                })
              });
              return skillObj;
            }, {})
          )
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    for (const attrKey in this.attributes) {
      this.attributes[attrKey].label = game.i18n.localize(CONFIG.RAILERS.attributes.character[attrKey]) ?? attrKey;
      for (const skillKey in this.attributes[attrKey].skills) {
        this.attributes[attrKey].skills[skillKey].label =
          game.i18n.localize(CONFIG.RAILERS.skills[attrKey]?.[skillKey]) ?? skillKey;
      }
    }

    const systemData = this.system;

    systemData.wounds.max = 6 + systemData.attributes.fortitude.value + systemData.attributes.fortitude.skills.endurance.value;
    systemData.load.onHand.max = 3 + systemData.attributes.prowess.value + systemData.attributes.prowess.skills.exertion.value;
    systemData.initiativePool = systemData.attributes.intuition.value + systemData.attributes.prowess.skills.athletics.value;

    let totalWounds = 0;
    let totalDamage = 0;
    let maxHitpoints = systemData.hitpoints.max;
    this.items.forEach(item => {
        if (item.type === "wound") {
            totalWounds += item.system.severity;
            totalDamage += item.system.damage;
        }
    });
    systemData.wounds.value = totalWounds;
    systemData.hitpoints.value = maxHitpoints - totalDamage;

    let totalOnHandLoad = 0;
    let totalStowedLoad = 0;

    for (let item of this.items) {
      let totalItemLoad = item.system.load * item.system.quantity;

      if (item.system.stowage === 'onHand') {
        totalOnHandLoad += totalItemLoad;
      } else if (item.system.stowage === 'stowed') {
        totalStowedLoad += totalItemLoad;
      }
    }
    systemData.load.onHand.value = totalOnHandLoad;
    systemData.load.stowed.value = totalStowedLoad;


    let totalInsulation = 0;
    let totalProtection = 0;

    for (let item of this.items) {

      if (item.type === 'clothing' && item.system.stowage === 'onHand') {
        totalInsulation += item.system.insulation;
        totalProtection += item.system.protection;
      }
    }

    systemData.defensePool = totalProtection + systemData.attributes.prowess.value;
    systemData.thermalThreshold = -1 * totalInsulation;


  }

  getRollData() {
    const data = {};

    // Flatten attributes for roll formulas (e.g., @combat.value, @combat.smallarms.value)
    if (this.attributes) {
      for (const [attrKey, attrData] of Object.entries(this.attributes)) {
        data[attrKey] = foundry.utils.deepClone(attrData);
        // Optionally flatten skills to top-level for convenience (e.g., @smallarms)
        for (const [skillKey, skillData] of Object.entries(attrData.skills)) {
          data[`${attrKey}.${skillKey}`] = foundry.utils.deepClone(skillData);
        }
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }
}
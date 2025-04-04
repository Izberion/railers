import RailersActorBase from './base-actor.mjs';

export default class RailersCharacter extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.Character'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    for (const key in this.abilities) {
      this.abilities[key].mod = Math.floor(
        (this.abilities[key].value - 10) / 2
      );
      this.abilities[key].label =
        game.i18n.localize(CONFIG.RAILERS.abilities[key]) ?? key;
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

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }
}
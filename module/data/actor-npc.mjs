import RailersActorBase from './base-actor.mjs';

export default class RailersNPC extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.NPC'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.attributes.npc || CONFIG.RAILERS.attributes.character).reduce((obj, attr) => {
        obj[attr] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0,
            max: 5 // Adjust max as needed
          })
        });
        return obj;
      }, {})
    );



    return schema;
  }

  prepareDerivedData() {
    for (const attrKey in this.attributes) {
      this.attributes[attrKey].label = game.i18n.localize(
        (CONFIG.RAILERS.attributes.npc || CONFIG.RAILERS.attributes.character)[attrKey]
      ) ?? attrKey;
    }

    const systemData = this.system;

    systemData.secondary = Math.floor(systemData.primary / 2)
    systemData.hitpoints.max = 2 * (systemData.primary + systemData.secondary)
    systemData.nerve.max = 2 * (systemData.hitpoints.max)
    systemData.wounds.max = 6 + systemData.primary + systemData.secondary;
    systemData.load.onHand.max = 3 + systemData.primary + systemData.secondary;
    systemData.initiativePool = systemData.primary;

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
    systemData.thermalThreshold = -1 * totalInsulation;    
  }
  getRollData() {
    const data = {};
    if (this.attributes) {
      for (const [attrKey, attrData] of Object.entries(this.attributes)) {
        data[attrKey] = foundry.utils.deepClone(attrData);
      }
    }
    return data;
  }
}
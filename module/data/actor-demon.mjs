import RailersActorBase from './base-actor.mjs';

export default class RailersDemon extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.Demon'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    return schema;
  }

  prepareDerivedData() {
    for (const attrKey in this.attributes) {
      this.attributes[attrKey].label = game.i18n.localize(
        (CONFIG.RAILERS.attributes.npc || CONFIG.RAILERS.attributes.character)[attrKey]
      ) ?? attrKey;
    }

    const systemData = this.system;

    systemData.wounds.max = systemData.attributes.endurance * 3;
    systemData.initiativePool = systemData.attributes.agility;

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
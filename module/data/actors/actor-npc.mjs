import RailersActorBase from './base-actor.mjs';

export default class RailersNPC extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.NPC'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.attributes.npc).reduce((obj, attr) => {
        obj[attr] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0
          })
        });
        return obj;
      }, {})
    );

    schema.combatPool = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData(); 

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

    let totalInsulation = 0;
    for (let item of this.parent.items) {
      if (item.type === 'clothing' && item.system.equipped === true) {
        totalInsulation += item.system.insulation;
      }
    }
    this.thermalThreshold = -1 * totalInsulation;

    this.wounds.max = this.attributes.primary.value + this.attributes.secondary.value;
    
    this.initiativePool = this.attributes.combatPool + this.initiativeMod ?? 0;

  }
}
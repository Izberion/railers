import RailersActorBase from './base-actor.mjs';

export default class RailersNPC extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.NPC'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

  schema.attributes = new fields.SchemaField(
    Object.keys(CONFIG.RAILERS.attributes.npc).reduce((obj, attr) => {
      const isPrimary = attr === "primary";
      obj[attr] = new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0
        }),
        first: new fields.StringField({ required: false, nullable: true, initial: null }),
        second: new fields.StringField({ required: false, nullable: true, initial: null }),
        ...(isPrimary ? {} : {
          third: new fields.StringField({ required: false, nullable: true, initial: null })
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

    const loadedMagIds = new Set(
      this.parent.items
        .filter(i => i.type === 'magazine' && i.system.loadedInWeapon)
        .map(i => i.id)
    );

    let totalOnHandLoad = 0;
    let totalStowedLoad = 0;
    for (let item of this.parent.items) {
      if (loadedMagIds.has(item.id)) continue;
      let totalItemLoad = item.system.load * item.system.quantity;
      if (item.system.stowage === 'onHand') {
        totalOnHandLoad += totalItemLoad;
      } else if (item.system.stowage === 'stowed') {
        totalStowedLoad += totalItemLoad;
      }
    }
    this.load.onHand.value = Math.ceil(totalOnHandLoad);
    this.load.stowed.value = Math.ceil(totalStowedLoad);

    let totalInsulation = 0;
    for (let item of this.parent.items) {
      if (item.type === 'clothing' && item.system.equipped === true) {
        totalInsulation += item.system.insulation;
      }
    }
    this.thermalThreshold = -1 * totalInsulation;

    const derivedStats = ["system.thermalThreshold"];

    // Apply active effects that target derived stats
    for (let effect of this.parent.appliedEffects) {
      for (let change of effect.changes) {
        if (!derivedStats.includes(change.key)) continue;
        const localKey = change.key.replace("system.", "");
        const current = foundry.utils.getProperty(this, localKey) ?? 0;
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.ADD)
          foundry.utils.setProperty(this, localKey, current + Number(change.value));
        else if (change.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE)
          foundry.utils.setProperty(this, localKey, Number(change.value));
        else if (change.mode === CONST.ACTIVE_EFFECT_MODES.MULTIPLY)
          foundry.utils.setProperty(this, localKey, current * Number(change.value));
      }
    }

    this.wounds.max = this.attributes.primary.value + this.attributes.secondary.value;
    
    this.initiativePool = this.combatPool + (this.initiativeMod ?? 0);

  }
}
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



    return schema;
  }

  prepareDerivedData() {
    for (const attrKey in this.attributes) {
      this.attributes[attrKey].label = game.i18n.localize(
        (CONFIG.RAILERS.attributes.npc)[attrKey]
      ) ?? attrKey;
    }   
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
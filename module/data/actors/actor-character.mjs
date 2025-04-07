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
      min: 0,
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
                  min: 0,
                  max: 0
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

    return data;
  }
}
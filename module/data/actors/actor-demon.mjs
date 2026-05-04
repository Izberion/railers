import RailersActorBase from './base-actor.mjs';

export default class RailersDemon extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.Demon'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RAILERS.attributes.demon).reduce((obj, attr) => {
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

    schema.tags = new fields.StringField({
      required: false,
      nullable: true,
      blank: true
    });

    schema.damage = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    schema.severity = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.wounds.max = this.attributes.endurance.value * 3;
    this.initiativePool = this.attributes.agility.value + this.initiativeMod ?? 0;
    if (!this.initiativeGroup) {
      const disposition = this.parent.token?.disposition 
        ?? this.parent.prototypeToken?.disposition 
        ?? CONST.TOKEN_DISPOSITIONS.HOSTILE;

      this.initiativeGroup = disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY
        ? game.i18n.localize("RAILERS.initiative.factions.tameDemons")
        : game.i18n.localize("RAILERS.initiative.factions.demons");
    }

    const hasSwarm = this.parent.items.some(i => 
      i.getFlag('railers', 'isSwarmAbility')
    );
    if (!hasSwarm) return;

    const hp = this.hitpoints?.value;
    if (hp == null) return;

    const swarmStat = Math.ceil(hp / 2);

    for (const attr of ["strength", "agility", "intellect", "endurance"]) {
      if (!this.attributes[attr]) continue;
      this.attributes[attr].value = swarmStat;
      this.damage = 1 + this.attributes.strength.value;
    }
  }
  
}
export default class RailersActorBase extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base'];


  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.hitpoints = new fields.SchemaField({
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: 0
      }),
      max: new fields.NumberField({ 
        required: false,
        nullable: true,
        integer: true,
        initial: 0,
        min: 0,
      })
    });

    schema.wounds = new fields.SchemaField({
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0,
      }),
      max: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: null,
        min: 0,
      }),
    });

    schema.nerve = new fields.SchemaField({
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: 0
      }),
      max: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: 0,
        min: 0,
      }),
    });

    schema.corruption = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.thermalThreshold = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null
    });

    schema.initiativePool = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0,
    });

    schema.initiativeMod = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0,
    });

    schema.initiativeGroup = new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    });

    schema.defensePool = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0,
    });

    schema.fear = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0,
    });

    schema.load = new fields.SchemaField({
      onHand: new fields.SchemaField({
        value: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null,
          min: 0
        }),
        max: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null,
          min: 0
        })
      }),
      stowed: new fields.SchemaField({
        value: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null,
          min: 0
        }),
        max: new fields.NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: 0,
          min: 0
        })
      })
    });

    schema.biography = new fields.HTMLField(); 

    schema.notes = new fields.HTMLField(); 

    return schema;
  }


  prepareDerivedData() {
    if (!this.attributes) return;
      const attrConfig = CONFIG.RAILERS.attributes[this.parent.type];
      if (!attrConfig) return;
      for (const attrKey in this.attributes) {
        this.attributes[attrKey].label =
          game.i18n.localize(attrConfig[attrKey]) ?? attrKey;
        // Skill labels if present
        for (const skillKey in this.attributes[attrKey].skills ?? {}) {
          this.attributes[attrKey].skills[skillKey].label =
            game.i18n.localize(CONFIG.RAILERS.skills[attrKey]?.[skillKey]) ?? skillKey;
        }
      }


    if (["character", "npc", "demon"].includes(this.parent.type)) {
      let totalWounds = 0;
      let totalDamage = 0;
      const maxHitpoints = this.hitpoints.max;

      this.parent.items.forEach(item => {
        if (item.type === "wound") {
          totalWounds += item.system.severity;
          totalDamage += item.system.damage;
        }
      });

      this.wounds.value = totalWounds;
      this.hitpoints.value = maxHitpoints - totalDamage;
    }

    const corruption = this.corruption ?? 0;
    this.demonizationStage = Math.min(5, Math.floor(corruption / 12));
    this.corruptionFloor = this.demonizationStage * 12;

  }  

  getRollData() {
    const data = {};
    if (!this.attributes) return data;
    for (const [attrKey, attrData] of Object.entries(this.attributes)) {
      data[attrKey] = foundry.utils.deepClone(attrData);
      for (const [skillKey, skillData] of Object.entries(attrData.skills ?? {})) {
        data[skillKey] = foundry.utils.deepClone(skillData);
      }
    }
    return data;
  }
}
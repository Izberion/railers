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
        initial: 0
      }),
      max: new fields.NumberField({ 
        required: false,
        nullable: true,
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
}
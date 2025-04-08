import RailersActorBase from './base-actor.mjs';

export default class RailersTrain extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.Train'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.locomotive = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'ace',
      choices: Object.keys(CONFIG.RAILERS.locomotiveOptions)
    });

    schema.speed = new fields.NumberField({
      ...requiredInteger,
      initial: 7, 
      min: 0
    });

    schema.fuel = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 100, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 100, min: 0 })
    });

    schema.armor = new fields.NumberField({
      ...requiredInteger,
      initial: 4, 
      min: 0
    });

    schema.power = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 24, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 24, min: 0 })
    });

    schema.weight = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1050, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1050, min: 0 })
    });

    schema.crew = new fields.NumberField({
      required: false,
      integer: true,
      nullable: true,
      initial: 0, 
      min: 0
    });

    schema.passengers = new fields.NumberField({
      required: false,
      integer: true,
      nullable: true,
      initial: 0, 
      min: 0
    });

    schema.rations = new fields.SchemaField({
      value: new fields.NumberField({
        required: false,
        integer: true,
        nullable: true,
        initial: 0, 
        min: 0
      }),
      max: new fields.NumberField({
        required: false,
        integer: true,
        nullable: true,
        initial: 0, 
        min: 0
      })
    });


    return schema;
  }

  prepareDerivedData() {
  }
}
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

    return schema;
  }

  prepareDerivedData() {
    const systemData = this.system;

    if (systemData.locomotive === "donkey") {
        let weight = systemData.weight.value;
        let speed = 8;
        let speedReduction = Math.floor(weight / 250);
        systemData.speed = speed - speedReduction;
        systemData.speed = Math.max(systemData.speed, 2);
      }
      
      let totalPower = 0;
      let totalWeight = 0;
      let maxPower = systemData.power.max;
      let maxWeight = systemData.weight.max;
      for (let item of this.items) {
        if (item.type === "car") {
          totalPower += item.system.power;
          totalWeight += item.system.weight;
        } else {
          totalWeight += item.system.weight;
        }
      }
      systemData.power.value = maxPower - totalPower;
      systemData.weight.value = maxWeight - totalWeight;
  }
  getRollData() {
    const data = {
      locomotive: this.system.locomotive,
      speed: this.system.speed,
      fuel: this.system.fuel,
      armor: this.system.armor,
      power: this.system.power,
      weight: this.system.weight
    };
    return data;
  }
}
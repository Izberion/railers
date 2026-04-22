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

    schema.capacity = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    return schema;
  }

  prepareDerivedData() {
    if (this.locomotive === "donkey") {
      let weight = this.weight.value;
      let speed = 8;
      let speedReduction = Math.floor(weight / 250);
      this.speed = speed - speedReduction;
      this.speed = Math.max(this.speed, 2);
    }

    // Apply additional locomotive contributions before calculating totals
    for (let item of this.parent.items) {
      if (item.type === "locomotive") {
        this.power.max += Math.floor(item.system.powerCapacity * 0.5);
        this.weight.max += Math.floor(item.system.weightLimit * 0.5);
        this.fuel.max += Math.floor(item.system.fuelCapacity * 0.5);
      }
    }

    let totalPower = 0;
    let totalWeight = 0;
    let totalCapacity = this.capacity;

    const maxPower = this.power.max;
    const maxWeight = this.weight.max;

    for (let item of this.parent.items) {
      if (item.type === "car") {
        totalPower += item.system.power || 0;
        totalWeight += item.system.weight || 0;
        totalCapacity += item.system.capacity || 0;
      } else if (item.type !== "locomotive") {
        totalWeight += item.system.weight || 0;
      }
    }

    this.power.value = maxPower - totalPower;
    this.weight.value = maxWeight - totalWeight;
    this.capacity = totalCapacity;
  }

}
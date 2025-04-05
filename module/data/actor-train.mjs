import RailersActorBase from './base-actor.mjs';

export default class RailersTrain extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.Train'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.locomotive = new fields.StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: 'ace',
      choices: Object.keys(RAILERS.locomotiveOptions)
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
}
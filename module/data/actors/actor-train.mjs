import RailersActorBase from './base-actor.mjs';

export default class RailersTrain extends RailersActorBase {
  static LOCALIZATION_PREFIXES = ['RAILERS.Actor.base', 'RAILERS.Actor.Train'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const optionalInteger = { required: false, nullable: true, integer: true, initial: 0, min: 0 };
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

    schema.crewMembers = new fields.ArrayField(
      new fields.SchemaField({
        actorId: new fields.StringField({ required: true, blank: false }),
        capacityType: new fields.StringField({ required: true, blank: false, initial: "standardCoach" })
      })
    );

    schema.passengers = new fields.SchemaField({
      members: new fields.ArrayField(
        new fields.SchemaField({
          actorId: new fields.StringField({ required: true, blank: false }),
          capacityType: new fields.StringField({ required: true, blank: false, initial: "standardCoach" })
        })
      ),
      untracked: new fields.SchemaField({
        standardTrooper: new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 }),
        standardCoach:   new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 }),
        standardOther:   new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 }),
        luxuryCoach:     new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 }),
        luxuryPrivate:   new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 }),
        luxuryOther:     new fields.NumberField({ required: false, nullable: true, integer: true, initial: 0, min: 0 })
      })
    });

    schema.rations = new fields.SchemaField({
      value: new fields.NumberField({ ...optionalInteger }),
      max: new fields.NumberField({ ...optionalInteger }),
      bunker: new fields.SchemaField({
        value: new fields.NumberField({ ...optionalInteger }),
        max: new fields.NumberField({ ...optionalInteger })
      }),
      lounge: new fields.SchemaField({
        value: new fields.NumberField({ ...optionalInteger }),
        max: new fields.NumberField({ ...optionalInteger })
      }),
      other: new fields.SchemaField({
        value: new fields.NumberField({ ...optionalInteger }),
        max: new fields.NumberField({ ...optionalInteger })
      })
    });

    schema.capacity = new fields.SchemaField({
      standard: new fields.SchemaField({
        trooper: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        }),
        coach: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        }),
        other: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        })
      }),
      luxury: new fields.SchemaField({
        coach: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        }),
        private: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        }),
        other: new fields.SchemaField({
          used:  new fields.NumberField({ ...optionalInteger }),
          total: new fields.NumberField({ ...optionalInteger })
        })
      }),
      total: new fields.SchemaField({
        used:  new fields.NumberField({ ...optionalInteger }),
        total: new fields.NumberField({ ...optionalInteger })
      })
    });

    return schema;
  }

  prepareDerivedData() {

    // Apply additional locomotive contributions
    for (let item of this.parent.items) {
      if (item.type === "locomotive") {
        this.power.max += Math.floor(item.system.powerCapacity * 0.5);
        this.weight.max += Math.floor(item.system.weightLimit * 0.5);
        this.fuel.max += Math.floor(item.system.fuelCapacity * 0.5);
      }
    }

    const capacityKeyMap = {
      standardTrooper: ["standard", "trooper"],
      standardCoach:   ["standard", "coach"],
      standardOther:   ["standard", "other"],
      luxuryCoach:     ["luxury", "coach"],
      luxuryPrivate:   ["luxury", "private"],
      luxuryOther:     ["luxury", "other"]
    };

    // Capacity totals from cars
    for (let item of this.parent.items) {
      if (item.type === "car" && item.system.capacity > 0 && item.system.capacityType !== "none") {
        const [tier, type] = capacityKeyMap[item.system.capacityType] ?? [];
        if (tier && this.capacity[tier]?.[type] !== undefined) {
          this.capacity[tier][type].total += item.system.capacity;
          this.capacity.total.total += item.system.capacity;
        }
      }
    }

    // Capacity used from crew
    for (const member of this.crewMembers ?? []) {
      const [tier, type] = capacityKeyMap[member.capacityType] ?? [];
      if (tier && this.capacity[tier]?.[type] !== undefined) {
        this.capacity[tier][type].used += 1;
        this.capacity.total.used += 1;
      }
    }

    // Capacity used from tracked passengers
    for (const member of this.passengers.members ?? []) {
      const [tier, type] = capacityKeyMap[member.capacityType] ?? [];
      if (tier && this.capacity[tier]?.[type] !== undefined) {
        this.capacity[tier][type].used += 1;
        this.capacity.total.used += 1;
      }
    }

    // Capacity used from untracked passengers
    const untracked = this.passengers.untracked;
    const untrackedMap = {
      standardTrooper: untracked.standardTrooper ?? 0,
      standardCoach:   untracked.standardCoach   ?? 0,
      standardOther:   untracked.standardOther   ?? 0,
      luxuryCoach:     untracked.luxuryCoach     ?? 0,
      luxuryPrivate:   untracked.luxuryPrivate   ?? 0,
      luxuryOther:     untracked.luxuryOther     ?? 0,
    };
    for (const [key, count] of Object.entries(untrackedMap)) {
      const [tier, type] = capacityKeyMap[key] ?? [];
      if (tier && this.capacity[tier]?.[type] !== undefined) {
        this.capacity[tier][type].used += count;
        this.capacity.total.used += count;
      }
    }

    // Power and weight consumption from cars
    let totalPower  = 0;
    let totalWeight = 0;

    for (let item of this.parent.items) {
      if (item.type === "car") {
        totalPower  += item.system.power  || 0;
        totalWeight += item.system.weight || 0;
      } else if (item.type !== "locomotive") {
        totalWeight += item.system.weight || 0;
      }
    }

    this.power.value  = this.power.max  - totalPower;
    this.weight.value = this.weight.max - totalWeight;

    if (this.locomotive === "donkey") {
      const speedReduction = Math.floor(totalWeight / 250);
      this.speed = Math.max(8 - speedReduction, 2);
    }

    // Derived counts
    this.crew = (this.crewMembers ?? []).length;
    this.totalPassengers = (this.passengers.members ?? []).length +
      Object.values(this.passengers.untracked ?? {}).reduce((sum, n) => sum + (n ?? 0), 0);
  }
}
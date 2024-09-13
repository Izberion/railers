/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class RailersActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();

    }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.railers || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    this._prepareTrainData(actorData);
    this._prepareDemonData(actorData);


    if (this.type === "character" || this.type === "npc" || this.type === "demon") {
      let totalWounds = 0;
      let totalDamage = 0;

      // Store the maximum hitposystem.ints value
      let maxHitpoints = systemData.hitpoints.max;

      // Iterate over the items in the actor
      this.items.forEach(item => {
        if (item.type === "wound") {
          // Increase the total wounds and damage
          totalWounds += item.system.severity;
          totalDamage += item.system.damage;
        }
      });

      // Update the actor's data
      systemData.wounds.value = totalWounds;
      systemData.hitpoints.value = maxHitpoints - totalDamage;
   
      
      if (this.type === "character" || this.type === "npc") {

        // Initialize total loads
        let totalOnHandLoad = 0;
        let totalStowedLoad = 0;

        // Iterate over each item
        for (let item of this.items) {
          // Calculate the item's total load based on its quantity
          let totalItemLoad = item.system.load * item.system.quantity;

          // Add the item's total load to the correct total
          if (item.system.stowage === 'onHand') {
            totalOnHandLoad += totalItemLoad;
          } else if (item.system.stowage === 'stowed') {
            totalStowedLoad += totalItemLoad;
          }
        }
        systemData.load.onHand.value = totalOnHandLoad;
        systemData.load.stowed.value = totalStowedLoad;


        // Initialize total insulation and protection
        let totalInsulation = 0;
        let totalProtection = 0;

        // Loop through all items
        for (let item of this.items) {

          // Check if the item is on hand
          if (item.type === 'clothing' && item.system.stowage === 'onHand') {
            // Add the item's insulation and protection to the total
            totalInsulation += item.system.insulation;
            totalProtection += item.system.protection;
          }
        }

        //Calculate defense pools
        if (this.type === "character") {
          systemData.defensePool = totalProtection + systemData.attributes.prowess.value;
        }

        if (this.type === "npc") {
          systemData.defensePool = totalProtection + systemData.secondary;
        }

        // Calculate thermal threshold
        systemData.thermalThreshold = -1 * totalInsulation;
      
      }
    }
  }


  
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Calculate wound threshold
    systemData.wounds.max = 6 + systemData.attributes.fortitude.value + systemData.attributes.fortitude.skills.endurance.value;

    // Calculate load limit
    systemData.load.onHand.max = 3 + systemData.attributes.prowess.value + systemData.attributes.prowess.skills.exertion.value;

    // Calculate initiative pool
    systemData.initiativePool = systemData.attributes.intuition.value + systemData.attributes.prowess.skills.athletics.value;
    
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Calculate secondary pool
    systemData.secondary = Math.floor(systemData.primary / 2)

    // Calculate max HP
    systemData.hitpoints.max = 2 * (systemData.primary + systemData.secondary)

    // Calculate max Nerve
    systemData.nerve.max = 2 * (systemData.hitpoints.max)

    // Calculate wound threshold
    systemData.wounds.max = 6 + systemData.primary + systemData.secondary;

    // Calculate load limit
    systemData.load.onHand.max = 3 + systemData.primary + systemData.secondary;

    // Calculate initiative pool
    systemData.initiativePool = systemData.primary;
  }

  _prepareDemonData(actorData) {
    if (actorData.type !== 'demon') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Calculate wound threshold
    systemData.wounds.max = systemData.attributes.endurance * 3;

    // Calculate initiative pool
    systemData.initiativePool = systemData.attributes.agility;
  }

  _prepareTrainData(actorData) {
    if (actorData.type !== 'train') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Calculate Donkey locomotive speeds
    if (systemData.locomotive === "donkey") {
      let weight = systemData.weight.value;
      let speed = 8;
  
      // Calculate the speed reduction based on weight
      let speedReduction = Math.floor(weight / 250);
  
      // Update the speed
      systemData.speed = speed - speedReduction;
  
      // Ensure the speed doesn't go below the minimum (2)
      systemData.speed = Math.max(systemData.speed, 2);
    }
    
    //Calculate car contributions to weight and power
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

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);
    this._getDemonRollData(data);
    this._getTrainRollData(data);
    return data;
  }
 
  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores and skills to the top level, so that rolls can use
    // formulas like `@str.mod + 4` or `@athletics`.
    if (data.attributes) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
        if (v.skills) {
          for (let [skillKey, skillValue] of Object.entries(v.skills)) {
            data[skillKey] = foundry.utils.deepClone(skillValue);
          }
        }
      }
    }


  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

  }

  _getDemonRollData(data) {
    if (this.type !== 'demon') return;

  }

  _getTrainRollData(data) {
    if (this.type !== 'train') return;

  }

}

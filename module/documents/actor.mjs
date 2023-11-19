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

    if (this.type === "character" || this.type === "npc") {
      let totalWounds = 0;
      let totalDamage = 0;

      // Store the maximum hitposystem.ints value
      let maxHitpoints = this.system.hitpoints.max;

      // Iterate over the items in the actor
      this.items.forEach(item => {
        if (item.type === "wound") {
          // Increase the total wounds and damage
          totalWounds += item.system.severity;
          totalDamage += item.system.damage;
        }
      });

      // Update the actor's data
      this.system.wounds.value = totalWounds;
      this.system.hitpoints.value = maxHitpoints - totalDamage;
   

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
    this.system.load.onHand.value = totalOnHandLoad;
    this.system.load.stowed.value = totalStowedLoad;



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

    // Calculate thermal threshold
    this.system.thermalThreshold = -1 * totalInsulation;

    if (this.type === "character") {
      // Calculate defense pool
      this.system.defensePool = totalProtection + this.system.attributes.prowess.value;

      // Calculate wound threshold
      this.system.wounds.max = 6 + this.system.attributes.fortitude.value + this.system.attributes.fortitude.skills.endurance.value;

      // Calculate load limit
      this.system.load.onHand.max = 3 + this.system.attributes.prowess.value + this.system.attributes.prowess.skills.exertion.value;

      // Calculate initiative pool
      this.system.initiativePool = this.system.attributes.intuition.value + this.system.attributes.prowess.skills.athletics.value;
    }
  }

    if (this.type === "train") {   
      if (this.system.locomotive === "donkey") {
        let weight = this.system.weight.value;
        let speed = 8;
    
        // Calculate the speed reduction based on weight
        let speedReduction = Math.floor(weight / 250);
    
        // Update the speed
        this.system.speed = speed - speedReduction;
    
        // Ensure the speed doesn't go below the minimum (2)
        this.system.speed = Math.max(this.system.speed, 2);
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
    
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }

  _prepareDemonData(actorData) {
    if (actorData.type !== 'demon') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }

  _prepareTrainData(actorData) {
    if (actorData.type !== 'train') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
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

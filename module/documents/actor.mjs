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
   * Augment the actor source data with additional dynamic data that isn't
   * handled by the actor's DataModel. Data calculated in this step should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const systemData = this.system;

    switch (this.type) {
      case 'character':
        this._prepareCharacterData(systemData);
        break;
      case 'npc':
        this._prepareNPCData(systemData);
        break;
      case 'train':
        this._prepareTrainData(systemData);
        break;
      case 'demon':
        this._prepareDemonData(systemData);
        break;
      }

    if (this.type === "character" || this.type === "npc" || this.type === "demon") {
      
      let totalWounds = 0;
      let totalDamage = 0;
      let maxHitpoints = systemData.hitpoints.max;
      this.items.forEach(item => {
        if (item.type === "wound") {
          totalWounds += item.system.severity;
          totalDamage += item.system.damage;
        }
      });
      systemData.wounds.value = totalWounds;
      systemData.hitpoints.value = maxHitpoints - totalDamage;
    
      
      if (this.type === "character" || this.type === "npc") {

        let totalOnHandLoad = 0;
        let totalStowedLoad = 0;
        for (let item of this.items) {
          let totalItemLoad = item.system.load * item.system.quantity;
          if (item.system.stowage === 'onHand') {
            totalOnHandLoad += totalItemLoad;
          } else if (item.system.stowage === 'stowed') {
            totalStowedLoad += totalItemLoad;
          }
        }
        systemData.load.onHand.value = totalOnHandLoad;
        systemData.load.stowed.value = totalStowedLoad;


        let totalInsulation = 0;
        let totalProtection = 0;
        for (let item of this.items) {
          if (item.type === 'clothing' && item.system.stowage === 'onHand') {
            totalInsulation += item.system.insulation;
            totalProtection += item.system.protection;
          }
        }

        if (this.type === "character") {
          systemData.defensePool = totalProtection + systemData.attributes.prowess.value;
        }

        if (this.type === "npc") {
          systemData.defensePool = totalProtection + systemData.attributes.secondary.value;
        }

        systemData.thermalThreshold = -1 * totalInsulation;
      
      }
    }
  }

  _prepareCharacterData(systemData) {
    systemData.wounds.max = 6 + systemData.attributes.fortitude.value + systemData.attributes.fortitude.skills.endurance.value;
    systemData.load.onHand.max = 3 + systemData.attributes.prowess.value + systemData.attributes.prowess.skills.exertion.value;
    systemData.initiativePool = systemData.attributes.intuition.value + systemData.attributes.prowess.skills.athletics.value;
  }

  _prepareNPCData(systemData) {
    systemData.attributes.secondary.value = Math.floor(systemData.attributes.primary.value / 2);
    systemData.hitpoints.max = 2 * (systemData.attributes.primary.value + systemData.attributes.secondary.value);
    systemData.nerve.max = 2 * (systemData.hitpoints.max);
    systemData.wounds.max = 6 + systemData.attributes.primary.value + systemData.attributes.secondary.value;
    systemData.load.onHand.max = 3 + systemData.attributes.primary.value + systemData.attributes.secondary.value;
    systemData.initiativePool = systemData.attributes.primary.value;
  }

  _prepareDemonData(systemData) {
    systemData.wounds.max = systemData.attributes.endurance.value * 3;
    systemData.initiativePool = systemData.attributes.agility.value;
  }

  _prepareTrainData(systemData) {
    if (systemData.locomotive === "donkey") {
      let weight = systemData.weight.value;
      let speed = 8;
      let speedReduction = Math.floor(weight / 250);
      systemData.speed = speed - speedReduction;
      systemData.speed = Math.max(systemData.speed, 2);
    }
  
    let totalPower = 0;
    let totalWeight = 0;
    let totalCapacity = systemData.capacity;
  
    const maxPower = systemData.power.max;
    const maxWeight = systemData.weight.max;
  
    for (let item of this.items) {
      if (item.type === "car") {
        totalPower += item.system.power || 0;
        totalWeight += item.system.weight || 0;
        totalCapacity += item.system.capacity || 0;
      } else {
        totalWeight += item.system.weight || 0;
      }
    }
  
    // Update systemData
    systemData.power.value = maxPower - totalPower;
    systemData.weight.value = maxWeight - totalWeight;
    systemData.capacity = totalCapacity;
  }

  static getDefaultArtwork(actorData) {
    const type = actorData.type || 'default';
    const images = CONFIG.RAILERS.defaultImages.actors[type] || CONFIG.RAILERS.defaultImages.actors.default;
    return images;
  }

  /**
  * Handle custom active effects, especially for item-based formulas
  */
  async applyActiveEffects() {
    // Clear previous overrides
    const overrides = {};

    // Ensure derived data is ready
    this.prepareDerivedData();

    // Process all effects
    for (const effect of this.allApplicableEffects()) {
      if (effect.disabled) continue;
      for (const change of effect.changes) {
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM) {
          try {
            const rollData = effect.parent.getRollData();
            const roll = new Roll(change.value, rollData);
            const result = roll.evaluateSync();
            const value = Math.floor(Number(result.total) || 0);
            const key = change.key.replace(/^system\./, '');
            foundry.utils.setProperty(overrides, key, value);
          } catch (err) {}
        }
      }
    }

    // Apply standard effects
    super.applyActiveEffects();

    // Merge overrides
    foundry.utils.mergeObject(this.system, overrides);
  }

  /**
   *
   * @override
   * Augment the actor's default getRollData() method by appending the data object
   * generated by the its DataModel's getRollData(), or null. This polymorphic
   * approach is useful when you have actors & items that share a parent Document,
   * but have slightly different data preparation needs.
   */
  getRollData() {
    return { ...super.getRollData(), ...(this.system.getRollData?.() ?? null) };
  }
}
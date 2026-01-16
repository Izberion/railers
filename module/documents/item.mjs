/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RailersItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  prepareDerivedData() {
    const systemData = this.system;

    switch (this.type) {
      case 'ability':
        this._prepareAbilityData(systemData);
        break;
      case 'car':
        this._prepareCarData(systemData);
        break;
      case 'cargo':
        this._prepareCargoData(systemData);
        break;
      case 'clothing':
        this._prepareClothingData(systemData);
        break;
      case 'gear':
        this._prepareGearData(systemData);
        break;
      case 'weapon':
        this._prepareWeaponData(systemData);
        break;
      case 'wound':
        this._prepareWoundData(systemData);
        break;
    }
  }

  _prepareAbilityData(systemData){};
  _prepareCarData(systemData){};
  _prepareCargoData(systemData){};
  _prepareClothingData(systemData){};
  _prepareGearData(systemData){};
  _prepareWeaponData(systemData){
    const skill = systemData.skill;
    if (skill === "exertion") {
      systemData.attribute = "prowess";
    } else {
      systemData.attribute = "combat";
    }
  };
  _prepareWoundData(systemData){};

  static getDefaultArtwork(itemData) {
    const type = itemData.type || 'default';
    const images = CONFIG.RAILERS.defaultImages.items[type] || CONFIG.RAILERS.defaultImages.items.default;
    return {
      img: images.img || images.item || "icons/svg/item-bag.svg",  
    };
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData.actor);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
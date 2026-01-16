export class RailersCombat extends Combat {
  /** @override */
  async rollInitiative(ids = [], formula = null, messageOptions = {}) {
    // Use the system formula if none is provided
    if (!formula) {
      formula = this.settings.formula;
    }
    
    // Call the parent rollInitiative
    await super.rollInitiative(ids, formula, messageOptions);
    
    // Format initiative values correctly (hits.pool format)
    const updates = [];
    
    for (let id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant || !combatant.actor) continue;
      
      const initiativePool = combatant.actor.system.initiativePool || 0;
      const rollResult = combatant.initiative;
      
      if (rollResult !== null && initiativePool > 0) {
        // Format: hits.poolSize
        // Handle negative rolls correctly
        const hits = Math.trunc(rollResult);
        const poolDecimal = initiativePool / 100;
        const sign = rollResult < 0 ? -1 : 1;
        const formattedInitiative = hits + (sign * poolDecimal);
        
        updates.push({
          _id: combatant.id,
          initiative: formattedInitiative
        });
      }
    }
    
    // Update all combatants at once
    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("Combatant", updates);
    }
  }
}

export class RailersCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /** @override */
  _getEntryContextOptions() {
    let options = super._getEntryContextOptions();
    for (let option of options) {
      if (option.name === "COMBAT.CombatantReroll") {
        option.condition = (li) => {
          let combatantId = li.data("combatant-id");
          let combatant = this.combat.combatants.get(combatantId);
          let actor = combatant?.actor;
          // Show reroll option for any combatant with an actor
          return !!actor;
        }
      }
    }
    return options;
  }
}
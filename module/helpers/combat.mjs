export class RailersCombatTracker extends CombatTracker {
  /** @override */
  _getEntryContextOptions() {
    let options = super._getEntryContextOptions();
    for (let option of options) {
      if (option.name === "COMBAT.CombatantReroll") {
        option.condition = (li) => {
          let combatant = this.combat.getCombatant(li.data("combatant-id"));
          let actor = combatant.actor;
          if (actor && actor.system.faction) {
            return actor.system.faction;
          } else {
            return combatant.name;
          }
        }
      }
    }
    return options;
  }
}

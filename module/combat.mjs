export class RailersCombatant extends Combatant {
  get faction() {
    return this.actor.system.faction;
  }
}

export class RailersCombatTracker extends CombatTracker {
  async render(...args) {
    const result = await super.render(...args);
    this.element.find('.combatant').each((i, el) => {
      const li = $(el);
      console.log(super.combat)
      const combatantId = li.data('combatant-id');
      const combatant = this.combat.getCombatant(combatantId);
      li.find('.token-name').text(combatant.faction);
    });
    return result;
  }
}
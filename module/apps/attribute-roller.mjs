export class AttributeRoller extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "attribute-roller",
    tag: "form",
    window: {
      title: "RAILERS.apps.attributeRoller.title",
      icon: "fas fa-dice",
      resizable: false,
    },
    position: {
      width: 320,
      height: "auto"
    },
    actions: {
      rollAll: this.#onRollAll,
      apply: this.#onApply
    }
  };

  static PARTS = {
    content: {
      template: "systems/railers/templates/apps/attribute-roller.hbs"
    }
  };

  constructor(options = {}) {
    super(options);
    this.actor = options.actor;
    this.rolls = {};
  }

  async _prepareContext(options) {
    const attributes = Object.keys(CONFIG.RAILERS.attributes.character);
    const anyExploded = Object.values(this.rolls).some(r => r.exploded);
    const allRolled = Object.keys(this.rolls).length === attributes.length;

    return {
        attributes,
        systemAttributes: this.actor.system.attributes,
        rolls: this.rolls,
        anyExploded,
        allRolled,
        hasRolled: Object.keys(this.rolls).length > 0
        };
  }

  static async #onRollAll(event, target) {
    if (Object.keys(this.rolls).length > 0) return;
    const attributes = Object.keys(CONFIG.RAILERS.attributes.character);
    for (const attr of attributes) {
        const roll = new Roll("1d8x8");
        await roll.evaluate();
        const exploded = roll.terms[0].results.length > 1;
        this.rolls[attr] = { total: roll.total, exploded };
    }
    this.render();
  }

  static async #onApply(event, target) {
    const attributes = Object.keys(CONFIG.RAILERS.attributes.character);

    if (Object.keys(this.rolls).length < attributes.length) {
      ui.notifications.warn(game.i18n.localize("RAILERS.apps.attributeRoller.rollFirst"));
      return;
    }

    const anyExploded = Object.values(this.rolls).some(r => r.exploded);
    const updateData = {};

    for (const attr of attributes) {
      updateData[`system.attributes.${attr}.value`] = this.rolls[attr].total;
    }

    if (!anyExploded) {
      const bonusAttr = this.element.querySelector("select[name='bonusAttribute']")?.value;
      if (bonusAttr) {
        updateData[`system.attributes.${bonusAttr}.value`] += 8;
      }
    }

    await this.actor.update(updateData);
    ui.notifications.info(game.i18n.localize("RAILERS.apps.attributeRoller.applied"));
    this.close();
  }
}
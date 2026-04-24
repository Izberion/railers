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
        this.rolls[attr] = { roll, total: roll.total, exploded };
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

    let bonusAttr = null;
    if (!anyExploded) {
      bonusAttr = this.element.querySelector("select[name='bonusAttribute']")?.value;
      if (bonusAttr) {
        updateData[`system.attributes.${bonusAttr}.value`] += 8;
      }
    }

    // Create chat message with all rolls
    const rollsHtml = Object.entries(this.rolls)
      .map(([attr, data]) => {
        const attrLabel = game.i18n.localize(`RAILERS.Attributes.${attr.charAt(0).toUpperCase() + attr.slice(1)}`);
        const bonus = !anyExploded && attr === bonusAttr ? " <strong>(+8)</strong>" : "";
        const exploded = data.exploded ? ` <em>(${game.i18n.localize("RAILERS.apps.attributeRoller.exploded")})</em>` : "";
        return `<div><strong>${attrLabel}:</strong> ${data.total}${bonus}${exploded}</div>`;
      })
      .join("");

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const messageMode = game.settings.get("core", "messageMode");

    const messageData = {
      speaker: speaker,
      flavor: game.i18n.localize("RAILERS.apps.attributeRoller.title"),
      messageMode: messageMode,
      content: `<div class="railers-attribute-rolls">${rollsHtml}</div>`,
      rolls: Object.values(this.rolls).map(r => r.roll)
    };

    await ChatMessage.create(messageData);

    await this.actor.update(updateData);
    this.close();
  }
}
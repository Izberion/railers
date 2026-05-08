export class ActorTweaks extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "actor-tweaks",
    tag: "form",
    window: {
      title: "RAILERS.apps.actorTweaks.title",
      icon: "fas fa-wrench",
      resizable: false,
    },
    position: {
      top: 100,
      left: 140,
      width: 360,
      height: "auto"
    },
    actions: {
      submit: this.#onSubmit
    }
  };

  static PARTS = {
    content: {
      template: "systems/railers/templates/apps/actor-tweaks.hbs"
    }
  };

  constructor(options = {}) {
    super(options);
    this.actor = options.actor;
  }

  /** @override */
  async _prepareContext(options) {
    const { system } = this.actor;
    const actorType = this.actor.type;
    const showInitiative = ["character", "npc", "demon"].includes(actorType);
    const showCorruption = ["character", "npc"].includes(actorType);
    const showFearToggle = ["character", "npc"].includes(actorType);
    const showFear = this.actor.getFlag("railers", "showFear") ?? false;

    return {
      initiativeMod: system.initiativeMod ?? 0,
      initiativeGroup: system.initiativeGroup ?? "",
      corruption: system.corruption ?? 0,
      corruptionFloor: system.corruptionFloor ?? 0,
      showInitiative,
      showCorruption,
      showFearToggle,
      showFear,
      isGM: game.user.isGM
    };
  }

  static async #onSubmit(event, button, dialog) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new foundry.applications.ux.FormDataExtended(form).object;

    const updateData = {
      "system.initiativeMod": Number(formData.initiativeMod) || 0,
      "system.initiativeGroup": String(formData.initiativeGroup).trim() || "Unknown"
    };

    if (game.user.isGM && formData.corruptionOverride !== undefined) {
      updateData["system.corruption"] = Math.max(0, Number(formData.corruptionOverride));
    }

    if (["character", "npc"].includes(this.actor.type)) {
      await this.actor.setFlag("railers", "showFear", !!formData.showFear);
    }

    await this.actor.update(updateData);
    this.close();
  }
}
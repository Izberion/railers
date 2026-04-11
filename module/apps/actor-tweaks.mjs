export class ActorTweaks extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "actor-tweaks",
    tag: "form",
    window: {
      title: "RAILERS.apps.actorTweaks.title",
      icon: "fas fa-cog",
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
    const showInitiative = ["character", "demon"].includes(actorType);

    return {
      initiativeMod: system.initiativeMod ?? 0,          
      initiativeGroup: system.initiativeGroup ?? "",   
      showInitiative
      // Add more fields later
    };
  }

  static async #onSubmit(event, button, dialog) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new foundry.applications.ux.FormDataExtended(form).object;

    await this.actor.update({
      "system.initiativeMod": Number(formData.initiativeMod) || 0,
      "system.initiativeGroup": String(formData.initiativeGroup).trim() || "Unknown"
    });

    this.close();
  }
}
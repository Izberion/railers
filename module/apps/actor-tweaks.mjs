export class ActorTweaks extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "actor-tweaks",
    tag: "form",
    window: {
      title: "RAILERS.apps.actorTweaks.title",
      icon: "fas fa-cog",
      resizable: false,
      width: 360,
      height: "auto"
    },
    position: {
      top: 100,
      left: 140
    },
    actions: {
      submit: this.#onSubmit
    },
    closeOnSubmit: true,
    handler: this.#onSubmit
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

    return {
      initiativeMod: system.initiativeMod ?? 0,          
      initiativeGroup: system.initiativeGroup ?? "",   
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

    const sheet = this.actor.sheet;
    if (sheet?.rendered) sheet.render();

    this.close();
  }
}
import { RAILERS } from "../helpers/config.mjs";

export async function locomotiveAdd(actor) {
  const locomotiveOptions = CONFIG.RAILERS.locomotiveOptions;

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/railers/templates/dialog/locomotive-add.hbs",
    { locomotiveOptions }
  );

    await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("RAILERS.dialogs.train.title") },
    position: { width: 250 },
    content,
    rejectClose: false,
    render: (event, dialog) => {
        const html = dialog.element;
        html.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
            const isPreset = e.target.value === "preset";
            html.querySelector('.mode-preset').style.display = isPreset ? '' : 'none';
            html.querySelector('.mode-manual').style.display = isPreset ? 'none' : '';
            });
        });
    },
    ok: {
      label: game.i18n.localize("RAILERS.dialogs.train.add"),
      icon: "fas fa-plus",
      callback: async (event, button, dialog) => {
        const formData = new foundry.applications.ux.FormDataExtended(button.form).object;
        const mode = formData.mode;

        let itemData;

        if (mode === "preset") {
          const key = formData.presetKey;
          const stats = CONFIG.RAILERS.locomotiveStats[key];
          if (!stats) {
            ui.notifications.warn(game.i18n.localize("RAILERS.dialogs.train.noPreset"));
            return;
          }
          const label = CONFIG.RAILERS.locomotiveOptions[key] 
            ?? key;
          itemData = {
            name: game.i18n.localize(label),
            type: "locomotive",
            system: {
              powerCapacity: stats.power,
              weightLimit: stats.weight,
              fuelCapacity: stats.fuel
            }
          };
        } else {
          const name = formData.name.trim() || game.i18n.localize("RAILERS.dialogs.train.namePlaceholder");
          itemData = {
            name,
            type: "locomotive",
            system: {
              powerCapacity: Number(formData.powerCapacity) || 0,
              weightLimit: Number(formData.weightLimit) || 0,
              fuelCapacity: Number(formData.fuelCapacity) || 0
            }
          };
        }

        await actor.createEmbeddedDocuments("Item", [itemData]);
        ui.notifications.info(`${itemData.name} ${game.i18n.localize("RAILERS.dialogs.train.added")}`);
      }
    }
  });
}
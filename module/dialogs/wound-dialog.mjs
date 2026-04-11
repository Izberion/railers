export async function addWoundDialog(actor) {
  const ItemCls = getDocumentClass("Item");

  const content = await foundry.applications.handlebars.renderTemplate("systems/railers/templates/dialog/wound-dialog.hbs");

  await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.localize("RAILERS.dialogs.wound.addWound")
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: game.i18n.localize("RAILERS.dialogs.wound.add"),
      icon: 'fas fa-check',
      callback: async (event, button, dialog) => {
        // Extract form data
        const formData = new FormData(button.form);
        const damage = parseInt(formData.get("wound-damage"), 10) || 1;
        const severity = parseInt(formData.get("wound-severity"), 10) || 1;
        const name = formData.get("wound-name") || ItemCls.defaultName({ type: "wound", parent: actor });

        // Prepare wound data
        const woundData = {
          name,
          type: "wound",
          system: {
            damage,
            severity
          }
        };

        // Create the wound item
        return ItemCls.create(woundData, { parent: actor });
      }
    },
    cancel: {
      icon: 'fas fa-times',
      label: game.i18n.localize("RAILERS.dialogs.base.cancel"),
      callback: () => {}
    }
  });
}
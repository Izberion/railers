export async function adjustThermsDialog(actor, mode) {
  const current = actor.system.therms ?? 0;
  const isAdd = mode === "add";

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/railers/templates/dialog/adjust-therms-dialog.hbs",
    {
      current,
      isAdd,
      mode: game.i18n.localize(isAdd 
        ? "RAILERS.Actor.base.actions.earnTherms" 
        : "RAILERS.Actor.base.actions.spendTherms"
      )
    }
  );

  await foundry.applications.api.DialogV2.prompt({
    window: { 
      title: game.i18n.localize(isAdd 
        ? "RAILERS.Actor.base.actions.earnTherms" 
        : "RAILERS.Actor.base.actions.spendTherms"
      )
    },
    position: { width: 250 },
    content,
    rejectClose: false,
    ok: {
      label: game.i18n.localize("RAILERS.dialogs.base.confirm"),
      icon: "fas fa-check",
      callback: async (event, button, dialog) => {
        const formData = new foundry.applications.ux.FormDataExtended(button.form).object;
        const amount = Number(formData.amount) || 0;
        if (amount <= 0) return;

        const newValue = isAdd 
          ? current + amount 
          : Math.max(0, current - amount);

        await actor.update({ "system.therms": newValue });
      }
    }
  });
}
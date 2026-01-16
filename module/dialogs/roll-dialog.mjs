export async function rollDialog(actor, target) {

  const dataset = target.dataset;
  const attpool = Number(dataset.attpool);
  const skillpool = Number(dataset.skillpool);
  const npcpool = Number(dataset.npcpool);
  const isSpecialSkill = dataset.special === "true";
  const rollName = dataset.label || "Roll";
  const characterName = actor.name;

  const content = await foundry.applications.handlebars.renderTemplate("systems/railers/templates/dialog/roll-dialog.hbs");

  await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.localize("RAILERS.dialogs.base.modifyDiceRoll")
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: game.i18n.localize("RAILERS.dialogs.base.roll"),
      icon: 'fas fa-check',
      callback: async (event, button, dialog) => {
        // Extract form data
        const formData = new FormData(button.form);
        const mod = parseInt(formData.get("modifier"), 10) || 0;
        const tn = parseInt(formData.get("tn"), 10) || 5;

        // Compute pool
        let poolTotal;
        if (isSpecialSkill) {
          poolTotal = skillpool;
        } else if (!isNaN(skillpool)) {
          poolTotal = skillpool + attpool;
        } else if (!isNaN(npcpool)) {
          poolTotal = npcpool;
        } else {
          poolTotal = attpool;
        }

        poolTotal += mod;

        // Build roll formula
        let rollFormula;
        if (poolTotal === 0) {
          rollFormula = `2d8kl1x8cs>=${tn}df=1`;
        } else if (poolTotal < 0) {
          rollFormula = "0";
        } else {
          rollFormula = `${poolTotal}d8x8cs>=${tn}df=1`;
        }

        // Roll and render
        const r = new Roll(rollFormula);
        await r.evaluate();
        const rollResultHTML = await r.render();
        const rollTotal = r.total;

        // Determine success type
        const successType =
          rollFormula === "0" || rollTotal <= 0
            ? game.i18n.localize("RAILERS.chat.result.failure")
            : game.i18n.localize("RAILERS.chat.result.success");

        // Post to chat
        await r.toMessage({
          user: game.user.id,
          speaker: {
            actor: actor,
            alias: characterName
          },
          flavor: !isNaN(npcpool)
            ? game.i18n.format("RAILERS.chat.roll.rollRoll", { tn })
            : game.i18n.format(
                isSpecialSkill || isNaN(skillpool) ? "RAILERS.chat.roll.rollSave" : "RAILERS.chat.roll.rollCheck",
                { rollName, tn }
              ),
          content: `${rollResultHTML}<div class="dice-results">${successType}</div>`
        });
      }
    },
    cancel: {
      icon: 'fas fa-times',
      label: game.i18n.localize("RAILERS.dialogs.base.cancel"),
      callback: () => {}
    },
    default: "ok"
  });
}
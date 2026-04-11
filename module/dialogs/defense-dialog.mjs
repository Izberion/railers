import { buildRollFormula } from "../helpers/roll-formula.mjs";

export async function defenseDialog(actor) {

    const defensePool = actor.system.defensePool;
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
          let poolTotal = defensePool;  
          poolTotal += mod;
  
          // Build roll formula
          const rollFormula = buildRollFormula(poolTotal, tn);
          if (!rollFormula) {
            await ChatMessage.create({
              user: game.user.id,
              speaker: { actor: actor, alias: characterName },
              flavor: game.i18n.format("RAILERS.chat.roll.rollDefense", { tn }),
              content: game.i18n.localize("RAILERS.chat.roll.automaticFailure")
            });
            return {};
          }
  
          // Roll and render
          const r = new Roll(rollFormula);
          await r.evaluate();
          const rollResultHTML = await r.render();
  
          // Post to chat
          await r.toMessage({
            user: game.user.id,
            speaker: { actor: actor, alias: characterName },
            flavor: game.i18n.format("RAILERS.chat.roll.rollDefense", { tn }),
            content: `${rollResultHTML}`
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
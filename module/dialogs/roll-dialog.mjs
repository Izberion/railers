export async function rollDialog(event, actor) {
    const rollable = event.target.dataset.rollable !== 'false';
    if (!rollable) return;
  
    const attpool = Number(event.target.dataset.attpool) || 0;
    const skillpool = Number(event.target.dataset.skillpool) || 0;
    const npcpool = Number(event.target.dataset.npcpool) || 0;
    const isSpecialSkill = event.target.dataset.special === 'true';
    const characterName = actor.name;
    const rollName = event.target.dataset.label;
  
    const content = await renderTemplate("systems/railers/templates/dialog/roll-dialog.hbs");
  
    const dialogReturn = await Dialog.wait({
      title: game.i18n.localize("RAILERS.dialogs.base.modifyDiceRoll"),
      content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("RAILERS.dialogs.base.roll"),
          callback: async (html) => {
            const mod = parseInt(html.find('input[name="modifier"]').val()) || 0;
            const tn = parseInt(html.find('select[name="tn"]').val()) || 5;
  
            let rollFormula;
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
  
            if (poolTotal === 0) {
              rollFormula = `2d8kl1x8cs>=${tn}`;
            } else if (poolTotal < 0) {
              rollFormula = "0";
            } else {
              rollFormula = `${poolTotal}d8x8cs>=${tn}`;
            }
  
            const r = new Roll(rollFormula);
            await r.evaluate(); 
            const rollResultHTML = await r.render();
            const rollTotal = r.total;
  
            let successType;
            if (rollFormula === "0") {
              successType = game.i18n.localize("RAILERS.chat.result.automaticFailure");
            } else if (isSpecialSkill) {
              successType = rollTotal <= 0 ? game.i18n.localize("RAILERS.chat.result.failure") : game.i18n.localize("RAILERS.chat.result.success");
            } else if (!isNaN(skillpool)) {
              if (rollTotal < 0) successType = game.i18n.localize("RAILERS.chat.result.complicatedFailure");
              else if (rollTotal === 0) successType = game.i18n.localize("RAILERS.chat.result.failure");
              else if (rollTotal <= 2) successType = game.i18n.localize("RAILERS.chat.result.complicatedSuccess");
              else if (rollTotal <= 4) successType = game.i18n.localize("RAILERS.chat.result.success");
              else successType = game.i18n.localize("RAILERS.chat.result.greatSuccess");
            } else {
              successType = rollTotal <= 0 ? game.i18n.localize("RAILERS.chat.result.failure") : game.i18n.localize("RAILERS.chat.result.success");
            }
  
            await r.toMessage({
              user: game.user.id,
              speaker: { actor: actor.id, alias: characterName },
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
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("RAILERS.dialogs.base.cancel")
        }
      },
      default: "one"
    });
  }
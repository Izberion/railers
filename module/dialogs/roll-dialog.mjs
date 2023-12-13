
export async function rollDialog(event, html) {
    const attpool = Number(event.currentTarget.dataset.attpool);
    const skillpool = Number(event.currentTarget.dataset.skillpool);
    const npcpool = Number(event.currentTarget.dataset.npcpool);
    const thisActor = event.data.actor;
    const characterName = thisActor.name;
    const rollName = event.currentTarget.dataset.label;
    const content = await renderTemplate("systems/railers/templates/dialog/roll-dialog.html");
    const dialogReturn = await Dialog.wait({
      title: game.i18n.localize("RAILERS.ModifyDiceRoll"),
      content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("RAILERS.Roll"),
          callback: async (html) => {
            const mod = parseInt(html.find('input[name="modifier"]').val()) || 0;
            const tn = parseInt(html.find('select[name="tn"]').val()) || 5;

            let rollFormula;
            let poolTotal;

            if (!isNaN(skillpool)) {
              poolTotal = skillpool;
              poolTotal += attpool;
            } else if (!isNaN(npcpool)) {
              poolTotal = npcpool;
            } else {
                poolTotal = attpool;
            }

            poolTotal += mod;

            if (poolTotal === 0) {
              rollFormula = `2d8kl1x8cs>=${tn}df=1`;
            } else if (poolTotal < 0) {
              rollFormula = "0";
            } else {
              rollFormula = `${poolTotal}d8x8cs>=${tn}df=1`;
            }

            const r = new Roll(rollFormula);
            await r.roll();
            const rollResultHTML = await r.render();
            const rollTotal = r.total;

            let successType;

            if (rollFormula === "0") {
              successType = game.i18n.localize("RAILERS.AutomaticFailure");
            }
            else if (!isNaN(skillpool)) {
              if (rollTotal < 0) {
                successType = game.i18n.localize("RAILERS.ComplicatedFailure");
              } else if (rollTotal === 0) {
                successType = game.i18n.localize("RAILERS.Failure");
              } else if (rollTotal >= 1 && rollTotal <= 2) {
                successType = game.i18n.localize("RAILERS.ComplicatedSuccess");
              } else if (rollTotal >= 3 && rollTotal <= 4) {
                successType = game.i18n.localize("RAILERS.Success");
              } else {
                successType = game.i18n.localize("RAILERS.GreatSuccess");
              }
            }
            else {  
              if (rollTotal <= 0) {
                successType = game.i18n.localize("RAILERS.Failure");
              } else {
                successType = game.i18n.localize("RAILERS.Success");
              }
            }
          
            await r.toMessage({
              user: game.user.id,
              speaker: {
                actor: thisActor,
                alias: characterName,
              },
              flavor: !isNaN(npcpool) ? game.i18n.format("RAILERS.RollRoll", { tn: tn }) : game.i18n.format(!isNaN(skillpool) ? "RAILERS.RollCheck" : "RAILERS.RollSave", { rollName: rollName, tn: tn }),
              content: `${rollResultHTML}<div class="dice-results">${successType}</div>`,
            });
            return {};
          },
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("RAILERS.Cancel"),
          callback: (html) => {
            return {};
          }
        }
      },
      default: "one",
    });
}
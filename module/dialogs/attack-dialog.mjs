export async function attackDialog(actor, target) {

  const itemId = target.closest(".item")?.dataset.itemId;
  const item = actor.items.get(itemId);

  const characterName = actor.name;
  const rollName = item.name;
  
  let attribute = 0;
  let skill = 0;
  if (actor.type === "npc") {
    attribute = Number(actor.system.combatPool) || 0;
  } else {
    attribute = Number(actor.system.attributes[item.system.attribute]?.mod) || 0;
    skill = Number(actor.system.attributes[item.system.attribute]?.skills[item.system.skill]?.value) || 0;
  }
  
  const damage = item.system.damage || 0;
  const severity = item.system.severity || 0;
  const isRanged = item.system.range !== "melee";

  const content = await foundry.applications.handlebars.renderTemplate("systems/railers/templates/dialog/attack-dialog.hbs", { isRanged });

  await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.localize("RAILERS.dialogs.attack.modifyAttackRoll")
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
        let tn = parseInt(formData.get("tn"), 10) || 5;
        const actionType = formData.get("actionType");

        // Compute roll
        let poolTotal = attribute + skill;
        let ammoReduction = 0;

        switch (actionType) {
          case "blindFire":
            poolTotal -= 3;
            ammoReduction = 1;
            break;
          case "burstFire":
            ammoReduction = 3;
            break;
          case "sustainedFire":
            ammoReduction = 10;
            break;
          case "fieldOfFire":
            poolTotal -= 2;
            ammoReduction = 30;
            break;
          case "reactiveShot":
            tn = Math.min(tn + 1, 8);
            ammoReduction = 1;
            break;
          default:
            ammoReduction = 1;
        }

        poolTotal += mod;

        // Check ammo
        if (isRanged && item.system.magazine?.value < ammoReduction) {
          ui.notifications.error(game.i18n.localize("RAILERS.dialogs.attack.notEnoughAmmo"));
          return {};
        }

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

        // Update ammo
        if (isRanged) {
          await item.update({ "system.magazine.value": item.system.magazine.value - ammoReduction });
        }

        // Post to chat
        await r.toMessage({
          user: game.user.id,
          speaker: {
            actor: actor,
            alias: characterName
          },
          flavor: game.i18n.format("RAILERS.chat.roll.rollAttack", { rollName, tn }),
          content: `${rollResultHTML}<div class="dice-results">${damage}/W${severity}</div>`
        });

        return {};
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: game.i18n.localize("RAILERS.dialogs.base.cancel"),
      callback: () => ({})
    }
  });
}
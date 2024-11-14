export async function attackDialog(event, html) {
  const thisActor = event.data.actor;
  const characterName = thisActor.name;
  const li = $(event.currentTarget).parents(".item");
  const item = thisActor.items.get(li.data("itemId"));
  const rollName = item.name;

  console.log(item);
  console.log(item.system.attribute);  
  const attribute = Number(thisActor.system.attributes[item.system.attribute].value);
  const skill = Number(thisActor.system.attributes[item.system.attribute].skills[item.system.skill].value);
  const damage = item.system.damage;
  const severity = item.system.severity;
  const isRanged = item.system.range !== 'melee';
  const content = await renderTemplate("systems/railers/templates/dialog/attack-dialog.html", { isRanged });
    const dialogReturn = await Dialog.wait({
    title: game.i18n.localize("RAILERS.ModifyAttackRoll"),
    content,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("RAILERS.Roll"),
        callback: async (html) => {
          const mod = parseInt(html.find('input[name="modifier"]').val()) || 0;
          let tn = parseInt(html.find('select[name="tn"]').val()) || 5;
          const actionType = html.find('select[name="actionType"]').val();

          let rollFormula;
          let poolTotal = attribute + skill;
          let ammoReduction = 0;

          switch(actionType) {
            case 'blindFire':
              poolTotal -= 3;
              ammoReduction = 1;
              break;
            case 'burstFire':
              ammoReduction = 3;
              break;
            case 'sustainedFire':
              ammoReduction = 10;
              break;
            case 'fieldOfFire':
              poolTotal -= 2;
              ammoReduction = 30;
              break;
            case 'reactiveShot':
              tn = 6;
              ammoReduction = 1;
              break;
            default:
              ammoReduction = 1;
          }

          poolTotal += mod;

          if (isRanged && item.system.magazine.value < ammoReduction) {
            ui.notifications.error(game.i18n.localize("RAILERS.NotEnoughAmmo"));
            return {};
          }

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

          if (isRanged) {
            item.update({'system.magazine.value': item.system.magazine.value - ammoReduction});
          }

          await r.toMessage({
            user: game.user.id,
            speaker: {
              actor: thisActor,
              alias: characterName,
            },
            flavor: game.i18n.format("RAILERS.RollAttack", { rollName: rollName, tn: tn }),
            content: `${rollResultHTML}<div class="dice-results">${damage}/W${severity}</div>`,
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

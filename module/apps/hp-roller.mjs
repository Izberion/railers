export async function onRollHp(event, actor) {
  event.preventDefault();
  // Demon HP roll
  if (actor.type === 'demon') {

    const useSwarmRoll = actor.items.some(i => i.getFlag('railers', 'isSwarmAbility'));

    let rollFormula;
    if (useSwarmRoll) {
      rollFormula = "2d8";
    } else {
      const endurance = Number(actor.system.attributes.endurance.value) || 0;
      rollFormula = `${endurance}d8`;
    }

    const roll = await new Roll(rollFormula).evaluate();
    await actor.update({ 'system.hitpoints.max': roll.total });
    return;
  }

  const hasPainless = actor.items.some(i => i.getFlag('railers', 'isPainless'));
  const diceMult = hasPainless ? 2 : 1;

  //NPC HP roll
  if (actor.type === 'npc') {
      let pool = Number(actor.system.attributes.secondary.value) || 0;
      if (pool < 1) pool = 1; 

      const hpFormula = `${pool * diceMult}d8x8`;

      const hpRoll = await new Roll(hpFormula).evaluate();

      await actor.update({ 'system.hitpoints.max': hpRoll.total });
      return;
    }

  //Character HP & Nerve roll
  if (actor.type !== 'character') return;

  const pool = Number(actor.system.attributes.fortitude.mod) || 0;

  let hpFormula, nerveFormula;
  if (pool <= 0) {
    hpFormula    = `${2 * diceMult}d8dh1x8`;
    nerveFormula = '4d8dh2x8';
  } else {
    hpFormula    = `${pool * diceMult}d8x8`;
    nerveFormula = `${pool * 2}d8x8`;
  }

  const hpRoll    = await new Roll(hpFormula).evaluate();
  const nerveRoll = await new Roll(nerveFormula).evaluate();

  const hpHtml    = await hpRoll.render();
  const nerveHtml = await nerveRoll.render();

  const currentHpMax   = Number(actor.system.hitpoints.max)   || 0;
  const currentNerveMax = Number(actor.system.nerve.max) || 0;

  const hpImproved   = hpRoll.total > currentHpMax;
  const nerveImproved = nerveRoll.total > currentNerveMax;

  // Apply updates
  const updates = {};
  if (hpImproved)   updates['system.hitpoints.max']   = hpRoll.total;
  if (nerveImproved) updates['system.nerve.max'] = nerveRoll.total;

  if (Object.keys(updates).length > 0) {
    await actor.update(updates);
  }

  // Unified chat message for characters only
  const speaker = ChatMessage.getSpeaker({ actor });
  const rollMode = game.settings.get("core", "rollMode");

  let flavor = `${game.i18n.localize("RAILERS.chat.roll.rollHPNerve")}`;
  let content = '';

  content += `
  <div class="dice-roll">
    <div>${game.i18n.localize("RAILERS.chat.hpNerve.hpRoll")}</div>
    ${hpHtml}
    <div class="dice-results">
      ${
        hpImproved
          ? `<span class="dice-result">${game.i18n.format("RAILERS.chat.hpNerve.newMaxHP", { currentHpMax })}</span>`
          : `<span class="dice-result">${game.i18n.format("RAILERS.chat.hpNerve.oldMaxHP", { currentHpMax })}</span>`
      }
    </div>
  </div>
  `;

  content += `
  <div class="dice-roll">
    <div>${game.i18n.localize("RAILERS.chat.hpNerve.nerveRoll")}</div>
    ${nerveHtml}
    <div class="dice-results">
      ${
        nerveImproved
          ? `<span class="dice-result">${game.i18n.format("RAILERS.chat.hpNerve.newMaxNerve", { currentNerveMax })}</span>`
          : `<span class="dice-result">${game.i18n.format("RAILERS.chat.hpNerve.oldMaxNerve", { currentNerveMax })}</span>`
      }
    </div>
  </div>
  `;

  const messageData = {
    speaker: speaker,
    flavor: flavor,
    rollMode: rollMode,
    content: content,
    rolls: [hpRoll, nerveRoll]
  };

  await ChatMessage.create(messageData);
}
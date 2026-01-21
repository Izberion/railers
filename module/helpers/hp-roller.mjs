export async function onRollHp(event, actor) {
  event.preventDefault();
  // Demon HP roll
  if (actor.type === 'demon') {

    let useSwarmRoll = false;
    const effectName = "Swarm";
    for (const item of actor.items) {
      if (item.type === 'ability' && item.name === 'Swarm') {
        useSwarmRoll = true;
        break;
      }
    }

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

  //NPC HP roll
  if (actor.type === 'npc') {
      let pool = Number(actor.system.attributes.secondary.value) || 0;
      if (pool < 1) pool = 1; 

      const hpFormula = `${pool}d8x8`;

      const hpRoll = await new Roll(hpFormula).evaluate();

      await actor.update({ 'system.hitpoints.max': hpRoll.total });
      return;
    }

  //Character HP & Nerve roll
  if (actor.type !== 'character') return;

  const pool = Number(actor.system.attributes.fortitude.mod) || 0;

  let hpFormula, nerveFormula;
  if (pool <= 0) {
    hpFormula    = '2d8kl1x8';
    nerveFormula = '4d8kl2x8';
  } else {
    hpFormula    = `${pool}d8x8`;
    nerveFormula = `${pool * 2}d8x8`;
  }

  const hpRoll    = await new Roll(hpFormula).evaluate();
  const nerveRoll = await new Roll(nerveFormula).evaluate();

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

  let flavor = `${actor.name} rolls for new maximum HP & Nerve`;
  let content = '';

  if (hpImproved || nerveImproved) {
    if (hpImproved) {
      content += `<div class="dice-results">HP improved. New max: ${hpRoll.total} (was ${currentHpMax})</div>`;
    }
    if (nerveImproved) {
      content += `<div class="dice-results">Nerve improved. New max: ${nerveRoll.total} (was ${currentNerveMax})</div>`;
    }
  } else {
    content = `<div class="dice-results">No improvement to HP or Nerve.</div>`;
  }

  const messageData = {
    speaker: speaker,
    flavor: flavor,
    rollMode: rollMode,
    content: content,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls: [hpRoll, nerveRoll]
  };

  await ChatMessage.create(messageData);
}
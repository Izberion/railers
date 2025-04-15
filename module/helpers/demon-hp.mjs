export async function onRollHp(event, actor) {
  event.preventDefault();
  if (actor.type !== 'demon') return;

  let useSwarmRoll = false;
  const effectName = "Swarm";
  for (const item of actor.items) {
    if (item.type === 'ability' && item.effects.some(e => e.name === effectName && !e.disabled)) {
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
}
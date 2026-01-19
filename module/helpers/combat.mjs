Hooks.once("init", () => {
  console.log("Group Initiative | Loaded");

  Hooks.on("updateCombatant", onCombatantUpdate);
});

async function onCombatantUpdate(combatant, changed) {
  if (changed.initiative === undefined) return;

  if (!combatant.actor) return;

  try {
    await finalizeGroupSlot(combatant);
  } catch (err) {
    console.error("Group Initiative | Finalization error", err);
  }
}

async function finalizeGroupSlot(combatant) {
  const actor = combatant.actor;
  if (!actor) return;

  const group = actor.system?.initiativeGroup ?? "unknown";

  await combatant.update({
    name: group,
    img: null,
    flags: {
      ...combatant.flags,
      yourSystem: {
        initiativeGroup: group
      }
    },
    actorId: null,
    tokenId: null
  });
}

function buildInitiativeFormula(pool) {
  if (pool > 0) {
    return {
      formula: `${pool}d8x8cs>=6df=1`,
      poolValue: pool
    };
  }

  if (pool === 0) {
    return {
      formula: `2d8kl1x8cs>=6df=1`,
      poolValue: 0
    };
  }

  return {
    formula: `2d8kl1cs>=6df=1`,
    poolValue: 0
  };
}

function encodeInitiative(X, Y) {
  const frac = Y / 100;

  return X >= 0
    ? X + frac
    : X - frac;
}

const _rollInitiative = Combat.prototype.rollInitiative;

Combat.prototype.rollInitiative = async function (ids, options = {}) {
  for (const id of ids) {
    const combatant = this.combatants.get(id);
    if (!combatant?.actor) continue;

    const actor = combatant.actor;
    const pool = actor.system?.initiativePool ?? 0;

    const { formula, poolValue } = buildInitiativeFormula(pool);

    const roll = await Roll.create(
      formula,
      actor.getRollData()
    ).evaluate();

    const group = actor.system?.initiativeGroup ?? "unknown";

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: game.i18n.format("RAILERS.chat.roll.rollInitiative", { group })
    });

    const X = roll.total ?? 0;
    const initiative = encodeInitiative(X, poolValue);

    await combatant.update({ initiative });
  }

  return this;
};

export class RailersCombat extends Combat {
  async rollInitiative(ids, options = {}) {
    for (const id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant?.actor) continue;

      const actor = combatant.actor;
      const pool = actor.system?.initiativePool ?? 0;

      const { formula, poolValue } = buildInitiativeFormula(pool);

      const roll = await new Roll(formula, actor.getRollData()).evaluate();

      let group = actor.system?.initiativeGroup?.trim();
      if (!group) {
        if (actor.type === "npc") {
          const disposition = combatant.token?.disposition
                  ?? actor.prototypeToken?.disposition
                  ?? CONST.TOKEN_DISPOSITIONS.HOSTILE;

          switch (disposition) {
            case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
              group = game.i18n.localize("RAILERS.initiative.factions.friendlyNpcs");
              break;
            case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
              group = game.i18n.localize("RAILERS.initiative.factions.neutralNpcs");
              break;
            case CONST.TOKEN_DISPOSITIONS.HOSTILE:
            default:
              group = game.i18n.localize("RAILERS.initiative.factions.hostileNpcs");
              break;
          }
        } else {
          group = game.i18n.localize("RAILERS.initiative.factions.unknown");
        }
      }

      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: game.i18n.format("RAILERS.chat.roll.rollInitiative", { group })
      });

      const initiative = encodeInitiative(roll.total ?? 0, poolValue);

      await combatant.update({ initiative });
    }

    return this;
  }
}

Hooks.once("init", () => {
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

  let group = actor.system?.initiativeGroup?.trim();
  if (!group) {
    const disposition = combatant.token?.disposition
      ?? actor.prototypeToken?.disposition
      ?? CONST.TOKEN_DISPOSITIONS.HOSTILE;

    if (actor.type === "demon") {
      group = disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY
        ? game.i18n.localize("RAILERS.initiative.factions.tameDemons")
        : game.i18n.localize("RAILERS.initiative.factions.demons");

    } else if (actor.type === "npc") {
      switch (disposition) {
        case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
          group = game.i18n.localize("RAILERS.initiative.factions.friendlyNpcs");
          break;
        case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
          group = game.i18n.localize("RAILERS.initiative.factions.neutralNpcs");
          break;
        case CONST.TOKEN_DISPOSITIONS.HOSTILE:
        default:
          group = game.i18n.localize("RAILERS.initiative.factions.hostileNpcs");
          break;
      }
    } else {
      group = game.i18n.localize("RAILERS.initiative.factions.unknown");
    }
  }

  await combatant.update({
    name: group,
    img: null,
    flags: {
      railers: {
        initiativeGroup: group
      }
    },
    actorId: null,
    tokenId: null
  });
}

function buildInitiativeFormula(pool) {
  if (pool > 0) {
    return { formula: `${pool}d8x8cs>=6df=1`, poolValue: pool };
  }
  if (pool === 0) {
    return { formula: `2d8dh1x8cs>=6df=1`, poolValue: 0 };
  }
  return { formula: `2d8dh1cs>=6df=1`, poolValue: 0 };
}

function encodeInitiative(X, Y) {
  const frac = Y / 100;
  return X >= 0 ? X + frac : X - frac;
}